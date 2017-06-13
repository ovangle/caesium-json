import {Map, Set, List, Iterable} from 'immutable';

import {resolveForwardRef} from '@angular/core';

import {Type, isBlank, isDefined, isFunction} from 'caesium-core/lang';
import {memoize} from 'caesium-core/decorators';
import {Codec, identity} from 'caesium-core/codec';

import {
    InvalidMetadata, StateException, PropertyNotFoundException, ArgumentError
} from "../exceptions";
import {ModelBase} from "./base";
import {ModelValues} from './values';

const _VALID_KIND_MATCH = /([a-z](?:\.[a-z])*)::([a-zA-Z]+)/;

function isValidKind(kind: string) {
    return kind.match(_VALID_KIND_MATCH);
}

export const _RESERVED_PROPERTY_NAMES = Set<string>([
    'metadata',
    'kind',
    'get',
    'set',
    'delete'
]);

export interface ModelOptions {
    kind: string;
    superType?: Type<any>;
    isAbstract?: boolean;
}

export class ModelMetadata<T> {
    static forType<U>(type: Type<U>): ModelMetadata<U> {
        const resolvedType = resolveForwardRef(type);
        const metadata = (resolvedType as any).__model_metadata__;
        if (!metadata) {
            throw `${type} is not an @Model annotated type`;
        }
        return metadata;
    }

    static forInstance<U>(instance: U): ModelMetadata<U> {
        var type = Object.getPrototypeOf(instance).constructor;
        return ModelMetadata.forType<U>(type);
    }

    readonly kind: string;

    readonly type: Type<T>;

    /// Basic support for model extensions.
    readonly superType: Type<any>;

    /**
     * An abstract model cannot be instantiated by a model factory.
     * It is intended to act purely as a supertype for other model types.
     */
    readonly isAbstract: boolean;

    /**
     * All the properties on the metadata.
     */
    readonly ownProperties: Map<string,BasePropertyMetadata>;

    get supertypeMeta(): ModelMetadata<any> {
        if (this.superType === ModelBase)
            return null;
        return ModelMetadata.forType(this.superType);
    }

    constructor(type: Type<T>, ownProperties: Map<string,BasePropertyMetadata>, options: ModelOptions) {
        this.type = type;
        this.ownProperties = ownProperties;

        if (!isValidKind(options.kind)) {
            throw new InvalidMetadata(`Invalid kind '${options.kind}' for model. Kind must match ${_VALID_KIND_MATCH}`);
        }
        this.kind = options.kind;

        if (isDefined(options.superType)) {
            var supertypeMeta = ModelMetadata.forType(options.superType);
            if (!supertypeMeta) {
                throw new InvalidMetadata(`Supertype ${supertypeMeta.kind} must be a model type`);
            }
            if (!supertypeMeta.isAbstract) {
                throw new InvalidMetadata(`Supertype ${supertypeMeta.kind} must be abstract`);
            }
        }

        this.superType = options.superType || <Type<any>>ModelBase;
        this.isAbstract = !!options.isAbstract;
    }

    checkHasPropertyOrRef(propNameOrRefName: string): void {
        var hasProperty = this.properties.has(propNameOrRefName)
                       || this.refNameMap.has(propNameOrRefName);
        if (!hasProperty) {
            throw new PropertyNotFoundException(propNameOrRefName, this);
        }
    }

    @memoize()
    get properties(): Map<string,BasePropertyMetadata> {
        let supertypeMeta = this.supertypeMeta;
        let superProperties = supertypeMeta
            ? supertypeMeta.properties
            : Map<string,BasePropertyMetadata>({id: PropertyMetadata.idProperty(this)});
        return superProperties.merge(this.ownProperties);
    }

    /**
     * A map of refNames to the associated property names.
     * @returns {Map<string, string>}
     */
    @memoize()
    get refNameMap(): Map<string,string> {
        return this.properties
            .filter((prop) => prop.isRef)
            .map((prop: RefPropertyMetadata) => prop.refName).toKeyedSeq()
            .flip().toMap();
    }

    toString() { return `ModelMetadata(${this.kind})`}
}

export interface BasePropertyOptions {
    readOnly?: boolean,
    writeOnly?: boolean,
    required?: boolean,
    allowNull?: boolean
}

function _setPropertyOptionDefaults(options: BasePropertyOptions): BasePropertyOptions {
    if (isBlank(options.readOnly))
        options.readOnly = false;
    if (isBlank(options.writeOnly))
        options.writeOnly = false;
    if (isBlank(options.required))
        options.required = true;
    if (isBlank(options.allowNull))
        options.allowNull = false;
    return options;
}


export interface PropertyOptions extends BasePropertyOptions {
    defaultValue?: () => any,
    codec: Codec<any,any>;
}

export class BasePropertyMetadata {
    defaultValue: () => any;

    /**
     * True if this property is a reference property.
     */
    isRef: boolean;

    /**
     * True if this property is a BackRef property.
     */
    isBackRef: boolean;

    /**
     * The name of the property on the model
     */
    name: string;

    /**
     * A readOnly property cannot be written to the server during a create or update
     * operation.
     *
     * Any value for this property will be dropped during serialization.
     * Defaults to `false`.
     */
    readOnly: boolean;

    /**
     * The property will never be present on values retrieved from the server,
     * but can be included when updating values on the server.
     * Default is `false`.
     */
    writeOnly: boolean;

    /**
     * The property is required on all create and update requests.
     * Will raise an error if the value is `undefined`.
     * Default is `true`.
     */
    required: boolean;

    /**
     * The value of this property is allowed to be `null`.
     * Default is `false`.
     */
    allowNull: boolean;

    /**
     * Used to serialize a value for this property.
     */
    codec: Codec<any,any>;

    constructor(name: string, options: BasePropertyOptions) {
        options = _setPropertyOptionDefaults(options);
        this.name = name;
        this.readOnly = options.readOnly;
        this.writeOnly = options.writeOnly;
        this.required = options.required;
        this.allowNull = options.allowNull;
    }

    /**
     * Get the value from the model values
     * @param modelValues
     * @returns {any}
     */
    valueAccessor(modelValues: ModelValues): any {
        if (modelValues.values.has(this.name)) {
            return modelValues.values.get(this.name);
        } else {
            return modelValues.initialValues.get(this.name);
        }
    }

    /**
     * Initialize the value in the modelValues.
     * @param modelValues
     * @param value
     * Contextual information for the initializer
     * @returns {{initialValues: Map<string, any>, values: Map<string, any>}}
     */
    valueInitializer(modelValues: ModelValues, value: any): ModelValues {
        var initialValues = modelValues.initialValues;
        if (initialValues.has(this.name))
            throw new StateException(`Property ${this.name} already initialized`);

        if (isDefined(value)) {
            initialValues = initialValues.set(this.name, value);
        } else if (isDefined(this.defaultValue)) {
            initialValues = modelValues.initialValues.set(this.name, this.defaultValue());
        }

        return {
            initialValues: initialValues,
            values: modelValues.values,
            resolvedRefs: modelValues.resolvedRefs
        }
    }

    /**
     * Mutate the value in the modelValues
     *
     * @param modelValues: The current model state
     * @param value: The new value of the property
     * @param context: Context for the mutator
     * @returns ModelValues: The new model state
     */
    valueMutator(modelValues: ModelValues, value: any, modelThis: ModelBase): ModelValues {
        return {
            initialValues: modelValues.initialValues,
            values: modelValues.values.set(this.name, value),
            resolvedRefs: modelValues.resolvedRefs
        };
    }
}

/**
 * A [PropertyMetadata] represents a model property with a value type, which is always
 * serialized onto the model.
 */
export class PropertyMetadata extends BasePropertyMetadata {
    /**
     * All models have an Id property. The id can be any type, as long as the type can be
     * converted using an `identity` codec.
     *
     * 'id' is never a required property, since models need to be created on the client
     * before they can be assigned an 'id'.
     *
     * @returns {PropertyMetadata}
     * @constructor
     */
    static idProperty(modelMetadata: ModelMetadata<any>): PropertyMetadata {
        //TODO: id should be a readOnly property
        // At the moment we scrub readOnly properties from the output,
        // which is not the correct thing to do.
        // Instead we should check property restrictions on the mutator/accessor.
        var id = new PropertyMetadata('id', {codec: identity, allowNull: true, defaultValue: () => null});
        return id;
    }

    isRef = false;
    isBackRef = false;

    /**
     * A function which provides a default value for the property.
     * If `null`, the property has no default value.
     */
    defaultValue: () => any;

    /// The attribute on the model, in the lowerCamelCase form of the attribute.
    /// Values for the property will be present on the serialized resource under the conversion of this attribute name
    /// to the 'lower_with_underscores' equivalent.
    /// eg. { helloWorld: 'hello world' }  would be serialized as { "hello_world": "hello world" }
    codec: Codec<any,any>;

    constructor(name: string, options: PropertyOptions) {
        super(name, options);
        this.defaultValue = options.defaultValue;
        this.codec = options.codec;
    }
}


export interface RefPropertyOptions extends BasePropertyOptions {
    refName: string;
    refType: Type<any>;
}

/**
 * Check that the value has an `id` property
 * @param value
 * @returns {string}
 * @private
 */
function hasIdProperty(value: any): boolean {
    return !!(Object.keys(value).find((k) => k === 'id'));
}


/**
 * A [RefProperty] is a property which stores the id of another model.
 *
 * A [RefProperty] is a property associated with another property name
 * on the model. The referenced property name cannot be a property
 * on the model
 *
 * The `value` property must be annotated with `@DoNotSerialize`, and no
 * mutations to the referenced model will be synced to the server when
 * this model is updated.
 */
export class RefPropertyMetadata extends BasePropertyMetadata {
    isRef = true;
    isBackRef = false;

    /**
     * The name of the property
     */
    name: string;

    /**
     * The name of the property on the model which stores the resolved value.
     *
     * It is an error for the `refName` to be a property on the model.
     */
    refName: string;

    /**
     * The type of the referenced model
     */
    refType: Type<any>;

    codec = identity;

    constructor(name: string, options: RefPropertyOptions) {
        super(name, options);
        this.refName = options.refName;
        if (!isDefined(options.refType)) {
            throw new ArgumentError('Cannot resolve refType. Try a forwardRef');
        }
        this.refType = options.refType;
    }

    valueInitializer(modelValues: ModelValues, value: any): ModelValues {
        if (isDefined(value) && modelValues.resolvedRefs.has(this.name)) {
            throw new StateException(`Property ${this.name} already initialized (via ref)`);
        }
        return super.valueInitializer(modelValues, value);
    }

    valueMutator(modelValues: ModelValues, value: any, modelThis: ModelBase): ModelValues {
        modelValues = super.valueMutator(modelValues, value, modelThis);
        // Clear the value of any resolved reference.
        // Currently only the id is known.
        return {
            initialValues: modelValues.initialValues,
            values: modelValues.values,
            resolvedRefs: modelValues.resolvedRefs.delete(this.name)
        };
    }

    /**
     * Gets the resolved value of the reference property.
     * Otherwise returns `undefined`.
     * @param modelValues
     * @returns {any}
     */
    refValueAccessor(modelValues: ModelValues) {
        return modelValues.resolvedRefs.get(this.name);
    }

    private _setIdValue(values: Map<string, any>, refValue: {id: any}): Map<string,any> {
        return values.set(this.name, isBlank(refValue) ? refValue : refValue.id);
    }

    refValueInitializer(modelValues: ModelValues, value: any): ModelValues {
        if (!isBlank(value) && !hasIdProperty(value)) {
            throw new TypeError('A model reference value must either be `null`, `undefined` or have an `id` property');
        }
        if (isDefined(value) && modelValues.initialValues.has(this.name)) {
            throw new StateException(`Property ${this.name} already initialized (via ref)`);
        }
        if (!isDefined(value))
            return modelValues;

        return {
            initialValues: this._setIdValue(modelValues.initialValues, value),
            values: modelValues.values,
            resolvedRefs: modelValues.resolvedRefs.set(this.name, value)
        }
    }

    refValueMutator(modelValues: ModelValues, value: any, modelThis: ModelBase): ModelValues {
        if (!isBlank(value) && !hasIdProperty(value)) {
            throw new TypeError('A model reference must either be `null`, `undefined` or have an `id` property');
        }

        // Otherwise, directly mutating the reference will also mutate the id.
        return {
            initialValues: modelValues.initialValues,
            values: this._setIdValue(modelValues.values, value),
            resolvedRefs: modelValues.resolvedRefs.set(this.name, value)
        }
    }
}
