import {Map} from 'immutable';
import {isBlank, isDefined} from 'caesium-core/lang';
import {ArgumentError} from './exceptions';
import {ModelBase} from './base';
import {PropertyMetadata, RefPropertyMetadata, BasePropertyMetadata} from './metadata';

export interface ModelValues {
    values: Map<string,any>;
    resolvedRefs: Map<string,any>;
}

export const initialModelValues: ModelValues = {
    values: Map<string,any>(),
    resolvedRefs: Map<string,any>()
};

export function isModelValues(obj: any) {
    if (isBlank(obj))
        return false;
    return obj.hasOwnProperty('values') && Map.isMap(obj.values)
        && obj.hasOwnProperty('resolvedRefs') && Map.isMap(obj.resolvedRefs);
}

export function mutateModelValues(modelValues: ModelValues, mutate: (mutator: ModelValues) => void) {
    let mutator = {
        values: modelValues.values.asMutable(),
        resolvedRefs: modelValues.resolvedRefs.asMutable()
    };
    mutate(mutator);
    return {
        values: mutator.values.asImmutable(),
        resolvedRefs: mutator.resolvedRefs.asImmutable()
    };
}

export interface Accessor<T extends BasePropertyMetadata> {
    property: T;

    /**
     * The name under which the accessor value is stored in model values.
     */
    name: string;

    // A descriptor which should be added to the
    descriptors: [string, PropertyDescriptor][];

    has(modelValues: ModelValues, ref: boolean): boolean;
    get(modelValues: ModelValues, ref: boolean): any;
    set(modelValues: ModelValues, value: any, ref: boolean): ModelValues;

    /**
     * Reset the property to it's default value.
     * @param modelValues
     */
    clear(modelValues: ModelValues): ModelValues;
}

export class ValueAccessor implements Accessor<PropertyMetadata> {
    constructor(public property: PropertyMetadata) {}

    get descriptors(): [string, PropertyDescriptor][] {
        return [
            accessorDescriptor(this, this.name)
        ];
    }

    get name(): string {
        return this.property.name;
    }

    has(modelValues: ModelValues, ref: boolean): boolean {
        if (ref)
            return false;
        // We always have a value for a normal property
        return true;
    }

    get(modelValues: ModelValues, ref: boolean): any {
        if (ref)
            throw new ArgumentError('Cannot edit ref of basic property');

        let value = modelValues.values.get(this.name);
        if (!isDefined(value)) {
            // Assume everything is immutable and return whatever the default value is.
            return this.property.default();
        }
        return value;
    }

    set(modelValues: ModelValues, value: any, ref: boolean): ModelValues {
        if (ref)
            throw new ArgumentError('Cannot edit ref of basic property');

        if (value === this.get(modelValues, ref)) {
            // If the value isn't being set (can't set to undefined)
            return modelValues;
        }

        return Object.assign({}, modelValues, {
            values: modelValues.values.set(this.name, value)
        });
    }

    clear(modelValues: ModelValues): ModelValues {
        return Object.assign({}, modelValues, {
            values: modelValues.values.remove(this.name)
        });
    }
}

export class RefAccessor implements Accessor<RefPropertyMetadata> {
    private _idAccessor: RefKeyAccessor;

    constructor(
        public property: RefPropertyMetadata,
        private _idProperty: PropertyMetadata
    ) {
        this._idAccessor = new RefKeyAccessor(_idProperty, property.name);
    }

    get descriptors(): [string, PropertyDescriptor][] {
        return [
            ...this._idAccessor.descriptors,
            accessorDescriptor(this, this.property.refName)
        ];
    }

    get name(): string {
        return this.property.name;
    }

    has(modelValues: ModelValues, ref: boolean) {
        let idValue = this._idAccessor.get(modelValues, false);
        if (!ref || idValue === null) {
            return this._idAccessor.has(modelValues, /* hasRef */ false);
        }
        return modelValues.resolvedRefs.has(this.name);
    }

    get(modelValues: ModelValues, ref: boolean): any {
        let idValue = this._idAccessor.get(modelValues, /* getRef */ false);

        if (!ref) {
            return idValue;
        }

        let refValue = modelValues.resolvedRefs.get(this.name);
        if (idValue === null && !isDefined(refValue)) {
            // If the key is null, the reference is always resolved.
            return null;
        }

        return modelValues.resolvedRefs.get(this.name);
    }

    set(modelValues: ModelValues, value: any, ref: boolean): ModelValues {
        if (value === this.get(modelValues, ref)) {
            // Value hasn't changed, don't update values.
            return modelValues;
        }

        if (!ref) {
            // Clear the value of the resolved ref before setting the new key.
            modelValues = this.clear(modelValues)
            modelValues = this._idAccessor.set(modelValues, value, /* getRef */ false);
            return modelValues;
        }
        let idValue: any;
        if (value === null) {
            idValue = null;
        } else if ('id' in value) {
            idValue = value.id;
        } else {
            throw new TypeError(
                'Only managed ModelBase instances (or `null`) can be used as the ' +
                'value of a reference property'
            );
        }

        return {
            values: modelValues.values.set(this.name, idValue),
            resolvedRefs: modelValues.resolvedRefs.set(this.name, value)
        };
    }

    clear(modelValues: ModelValues): ModelValues {
        return {
            values: modelValues.values.remove(this.name),
            resolvedRefs: modelValues.resolvedRefs.remove(this.name)
        };
    }

}

export class RefKeyAccessor extends ValueAccessor {
    // Access a Reference key value.
    // The name of the property is always the name of the key on the foreign model,
    // so it is overriden with the name of the reference property.
    constructor(property: PropertyMetadata, private refName: string) {
        super(property);
    }

    get name() {
        return this.refName;
    }
}



function accessorDescriptor(accessor: Accessor<any>, propNameOrRefName: string): [string, PropertyDescriptor] {
    let getRef = propNameOrRefName !== accessor.name;

    /*
     * NOTE:
     * Don't use fat arrow syntax in the descriptors, `this` should be bound to the model's `this`.
     */

    let descriptor = {
        enumerable: true,
        configurable: false,
        get: function() {
            return accessor.get(this.__modelValues__, getRef);
        },
        set: function (value: any) {
            // There is no way to prevent the generated javascript from
            // setting the values on supertype, so this should be a no-op
            // until the instance has been finalized by the proxy type.
            if (Object.isFrozen(this)) {
                throw new TypeError(
                    'Cannot set the value of ' + propNameOrRefName + ' via the attribute'
                );
            }
        }
    };
    return [propNameOrRefName, descriptor];
}




