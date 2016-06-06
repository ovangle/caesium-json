import {Map, Set} from 'immutable';

import {Type, isBlank, isDefined} from 'caesium-core/lang';
import {memoize} from 'caesium-core/decorators';
import {Codec, identity} from 'caesium-core/codec';

import {InvalidMetadata, StateException, PropertyNotFoundException} from "../exceptions";
import {modelResolver} from './reflection';
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

export class ModelMetadata {
    static forType(type: Type): ModelMetadata {
        return modelResolver.resolve(type);
    }

    static forInstance(instance: any): ModelMetadata {
        var type = Object.getPrototypeOf(instance).constructor;
        return ModelMetadata.forType(type);
    }

    kind: string;

    type: Type;

    /// Basic support for model extensions.
    superType: Type;

    /**
     * An abstract model cannot be instantiated by a model factory.
     * It is intended to act purely as a supertype for other model types.
     */
    isAbstract: boolean;

    ownProperties: Map<string, BasePropertyMetadata>;

    get supertypeMeta(): ModelMetadata {
        if (this.superType === ModelBase)
            return null;
        return modelResolver.resolve(this.superType);
    }

    constructor({kind, superType, isAbstract}: {kind: string, superType?: Type, isAbstract?: boolean}) {
        if (!isValidKind(kind)) {
            throw new InvalidMetadata(`Invalid kind '${kind}' for model. Kind must match ${_VALID_KIND_MATCH}`);
        }
        this.kind = kind;

        if (isDefined(superType)) {
            var supertypeMeta = ModelMetadata.forType(superType);
            if (!supertypeMeta) {
                throw new InvalidMetadata(`Supertype ${supertypeMeta.kind} must be a model type`);
            }
            if (!supertypeMeta.isAbstract) {
                throw new InvalidMetadata(`Supertype ${supertypeMeta.kind} must be abstract`);
            }
        }

        this.superType = superType || ModelBase;
        this.isAbstract = !!isAbstract;
    }

    checkHasPropertyOrRef(propNameOrRefName: string): void {
        var hasProperty = this.properties.has(propNameOrRefName)
                       || this.refNameMap.has(propNameOrRefName);
        if (!hasProperty) {
            throw new PropertyNotFoundException(propNameOrRefName, this);
        }
    }

    contribute(type: Type, ownProperties: Map<string,PropertyMetadata>) {
        if (isBlank(type) || type.length > 0)
            throw new InvalidMetadata(`Model ${type} must have a 0-argument constructor`);

        this.type = type;
        this.ownProperties = ownProperties;
        this.ownProperties.forEach((prop, propName) => {
            prop.contribute(this, propName);
        });
    }

    get properties(): Map<string,BasePropertyMetadata> { return this._getProperties(); }

    @memoize()
    private _getProperties(): Map<string,BasePropertyMetadata> {
        var supertypeMeta = this.supertypeMeta;
        var superProperties = supertypeMeta
            ? supertypeMeta.properties
            : Map<string,BasePropertyMetadata>({id: PropertyMetadata.idProperty(this)});
        return superProperties.merge(this.ownProperties);
    }

    /**
     * A map of refNames to the associated property names.
     * @returns {Map<string, string>}
     */
    get refNameMap(): Map<string,string> { return this._getRefNameMap(); }

    @memoize()
    private _getRefNameMap(): Map<string,string> {
        return this._getProperties()
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
    return options
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
     * The metadata which defines this property
     */
    metadata: ModelMetadata;

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

    constructor(options: BasePropertyOptions) {
        options = _setPropertyOptionDefaults(options);
        this.readOnly = options.readOnly;
        this.writeOnly = options.writeOnly;
        this.required = options.required;
        this.allowNull = options.allowNull;
    }

    /**
     * Sets the options on the property
     * @param metadata
     * The metadata of the model that this property belongs to.
     * @param propName
     * The property name on the model instance.
     */
    contribute(metadata: ModelMetadata, propName: string): void {
        if (_RESERVED_PROPERTY_NAMES.contains(propName))
            throw new InvalidMetadata(`${propName} is a reserved name and cannot be the name of a property`);
        this.name = propName;
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
     * @returns ModelValues: The new model state
     */
    valueMutator(modelValues: ModelValues, value: any): ModelValues {
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
    static idProperty(modelMetadata: ModelMetadata): PropertyMetadata {
        //TODO: id should be a readOnly property
        // At the moment we scrub readOnly properties from the output,
        // which is not the correct thing to do.
        // Instead we should check property restrictions on the mutator/accessor.
        var id = new PropertyMetadata({codec: identity, required: false});
        id.contribute(modelMetadata, 'id');
        return id;
    }

    isRef = false;

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

    constructor(options: PropertyOptions) {
        super(options);
        this.defaultValue = options.defaultValue;
        this.codec = options.codec;
    }
}


export interface RefPropertyOptions extends BasePropertyOptions {
    refName: string;
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

    codec = identity;

    constructor(options: RefPropertyOptions) {
        super(options);
        this.refName = options.refName;
    }

    contribute(modelMetadata: ModelMetadata, propName: string) {
        if (modelMetadata.properties.has(this.refName)) {
            throw new InvalidMetadata(
                'The `refName` of a property must not be annotated with @Property (or @RefProperty)'
            );
        }
        super.contribute(modelMetadata, propName);
    }

    valueInitializer(modelValues: ModelValues, value: any): ModelValues {
        if (isDefined(value) && modelValues.resolvedRefs.has(this.name)) {
            throw new StateException(`Property ${this.name} already initialized (via ref)`);
        }
        return super.valueInitializer(modelValues, value);
    }

    valueMutator(modelValues: ModelValues, value: any): ModelValues {
        modelValues = super.valueMutator(modelValues, value);
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

    refValueInitializer(modelValues: ModelValues, value: any) {
        if (!isBlank(value) && !isDefined(value.id)) {
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

    refValueMutator(modelValues: ModelValues, value: any): ModelValues {
        if (!isBlank(value) && !isDefined(value.id)) {
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
