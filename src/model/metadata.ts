import {OrderedMap, Set, List, Map, Iterable} from 'immutable';


import {forwardRef, resolveForwardRef, OpaqueToken} from '@angular/core';

import {Type, isBlank, isDefined, isFunction} from 'caesium-core/lang';
import {memoize} from 'caesium-core/decorators';
import {ArgumentError} from 'caesium-core/exception';
import {Codec, identity} from 'caesium-core/codec';

import {InvalidMetadata, ModelNotFoundException, PropertyNotFoundException} from './exceptions';
import {num} from '../json_codecs/index';

import {ModelOptions, BasePropertyOptions, defaultPropertyOptions, PropertyOptions, RefPropertyOptions} from './decorators';
import {ModelConstructor} from './factory';
import {ModelBase} from "./base";
import {ModelValues, Accessor, ValueAccessor, RefAccessor} from './values';

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

export class BasePropertyMetadata {

    /**
     * Is the property the key of the model?
     */
    key: boolean;

    default: () => any;
    /**
     * True if this property is a reference property.
     */
    isRef: boolean;

    /**
     * The metadata which defines this property
     */
    metadata: ModelMetadata;

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

    /**
     * The value of this proeprty is a list.
     */
    isMulti: boolean;

    /**
     * The value accessor for mutating model values.
     */
    valueAccessor: Accessor<any>;

    constructor(public modelType: Type<any>, public name: string, public type: Type<any>, options: BasePropertyOptions) {
        this.name = name;

        this.readOnly = options.readOnly;
        this.writeOnly = options.writeOnly;
        this.required = options.required;
        this.allowNull = options.allowNull;
        this.isMulti = options.isMulti;

        this.default = function () {
            if (isFunction(options.default)) {
                return (options.default as () => any)();
            }
            return options.default;
        }
    }

    /**
     * Check that the metadata is valid
     * @param modelMetadata
     * The metadata of the model that this property belongs to.
     * @param propName
     * The property name on the model instance.
     */
    checkValid(modelMetadata: ModelMetadata): void {
        if (this.readOnly && this.writeOnly) {
            throw new InvalidMetadata('A property cannot be both read and write only');
        }

        if (!isDefined(this.codec))
            throw new InvalidMetadata(
                'A codec must be set on the property'
            );

        if (_RESERVED_PROPERTY_NAMES.contains(this.name))
            throw new InvalidMetadata(`${this.name} is a reserved name and cannot be the name of a property`);

        let isNameUnique = modelMetadata.properties
            .filter(prop => prop !== this && prop.name === this.name)
            .isEmpty();

        if (!isNameUnique) {
            throw new InvalidMetadata(
                `There cannot be two properties with the same name (${this.name} on model ${modelMetadata.type}`
            );
        }
    }
}

/**
 * A [PropertyMetadata] represents a model property with a value type, which is always
 * serialized onto the model.
 */
export class PropertyMetadata extends BasePropertyMetadata {
    isRef = false;

    /// The attribute on the model, in the lowerCamelCase form of the attribute.
    /// Values for the property will be present on the serialized resource under the conversion of this attribute name
    /// to the 'lower_with_underscores' equivalent.
    /// eg. { helloWorld: 'hello world' }  would be serialized as { "hello_world": "hello world" }
    codec: Codec<any,any>;

    /**
     * Is the value of this property an instance of ModelBase?
     *
     * @returns {boolean}
     */
    get isNestedModel(): boolean {
        return this.type.prototype instanceof ModelBase;
    }

    constructor(modelType: Type<any>, name: string, paramType: Type<any>, options: PropertyOptions) {
        super(modelType, name, paramType, options);
        this.key = !!options.key;

        if (this.key) {
            this.readOnly = true;
            this.writeOnly = false;
            this.allowNull = true;
            this.required = true;
            this.default = () => null;
        }

        this.codec = options.codec;
        this.valueAccessor = new ValueAccessor(this);
        Object.freeze(this);
    }

    checkValid(modelMetadata: ModelMetadata) {
        super.checkValid(modelMetadata);
        if (this.key) {
            if (this.type !== Number && this.type !== String) {
                throw new InvalidMetadata('A key property must be either a Number or a String');
            }
        }
    }

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

    isMulti: boolean;

    key = false;

    constructor(modelType: Type<any>, name: string, type: Type<any>, options: RefPropertyOptions) {
        super(modelType, name, type, options);

        this.refName = options.refName;
        this.refType = resolveForwardRef(options.refType);
        this.isMulti = options.isMulti;
    }

    checkValid(modelMeta: ModelMetadata): void {
        super.checkValid(modelMeta);
        let foreignModel = ModelMetadata.forType(this.refType);

        if (!foreignModel.isManaged) {
            throw new InvalidMetadata('Can only declare an @RefProperty where the refType is a managed model');
        }

        let isRefNameValid = modelMeta.properties
            .filter(prop => prop.name === this.refName)
            .isEmpty()

        if (!isRefNameValid) {
            throw new InvalidMetadata(`refName (${this.refName}) cannot be the same as the name of another property on the model`)
        }

        let isUniqueRefName = modelMeta.properties
            .filter(prop => prop instanceof RefPropertyMetadata
                         && prop !== this
                         && prop.refName === this.refName)
            .isEmpty();

        if (!isUniqueRefName)
            throw new InvalidMetadata(`refName (${this.refName} cannot be the same as the refName of another property on the model`)

    }

    get valueAccessor() {
        return this._getValueAccessor();
    }

    @memoize()
    private _getValueAccessor(): Accessor<any> {
        let foreignModel = ModelMetadata.forType(this.refType);
        let foreignKey = foreignModel.keyProperty;

        return new RefAccessor(this, foreignKey);
    }


}

export class ModelMetadata {

    static forType(type: Type<any>): ModelMetadata {
        let metadata = (type as any).__model_metadata__;
        if (!isDefined(metadata)) {
            throw new ModelNotFoundException(type);
        }
        return metadata;
    }

    static forInstance(model: any): ModelMetadata {
        if ('__metadata__'in model)
            return (model as any).__metadata__;
        throw new ModelNotFoundException(model.constructor);
    }

    static _modelBaseMetadata = new ModelMetadata(
        forwardRef(() => ModelBase),
        OrderedMap <string, PropertyMetadata>(),
        { kind: 'core::ModModelBase' /* TODO: Get rid of fucking kind. */}
    );

    kind: string;

    /**
     * The annotated type of the model.
     */
    type: Type<any>;

    /// Basic support for model extensions.
    superType: Type<any>;
    private get superTypeMetadata(): ModelMetadata {
        if (this.superType === undefined)
            return ModelMetadata._modelBaseMetadata;
        return ModelMetadata.forType(this.superType);
    }

    /**
     * An abstract model cannot be instantiated by a model factory.
     * It is intended to act purely as a supertype for other model types.
     */
    isAbstract: boolean;

    /**
     * All properties defined directly on this object.
     */
    ownProperties: OrderedMap<string,BasePropertyMetadata>;

    // TODO: memoize needs to be applicable to properties.
    // eg.
    // @memoize
    // get properties(): OrderedMap<string,PropertyMetadata>

    /**
     * All the properties of the object, including inehrited properties
     */
    @memoize()
    private _getProperties(): OrderedMap<string,BasePropertyMetadata> {
        let inherited: OrderedMap<string,BasePropertyMetadata>;
        if (isDefined(this.superType)) {
            inherited = this.superTypeMetadata.properties;
        } else {
            inherited = ModelMetadata._modelBaseMetadata.ownProperties;
        }
        return inherited.merge(this.ownProperties);

    }
    get properties(): OrderedMap<string,BasePropertyMetadata> {
        return this._getProperties();
    }


    /**
     * Maps of the names of reference property to the name of the reference property
     * @returns {any}
     */
    @memoize()
    _getRefNameMap(): OrderedMap<string,string> {
        return this.properties.filter(prop => prop.isRef)
            .map((prop: RefPropertyMetadata) => prop.refName).toKeyedSeq()
            .flip().toOrderedMap();
    }

    get refNameMap(): OrderedMap<string,string> {
        return this._getRefNameMap();
    }

    /**
     * Is this model a managed model?
     * @returns {boolean}
     */
    get isManaged(): boolean {
        return this.properties.some(prop => prop.key);
    }

    /**
     * Get the key property of the model.
     * @returns {BasePropertyMetadata}
     */
    get keyProperty(): PropertyMetadata {
        return this.properties
            .filter(prop => prop.key)
            .first() as PropertyMetadata;
    }


    constructor(
        type: Type<any>,
        ownProperties: OrderedMap<string,BasePropertyMetadata>,
        options: ModelOptions
    ) {
        this.type = type && resolveForwardRef(type);
        this.kind = options.kind;
        this.ownProperties = ownProperties;

        this.superType = options.superType;
        this.isAbstract = !!options.isAbstract;
    }

    get path(): string[] {
        let [resource, type] = this.kind.split('::');
        return resource.split('.');
    }

    /**
     * Validate the model metadata.
     *
     * Returns a boolean which can be discarded. The only purpose of the return value
     * is to cache the result of validation so that it is only performed once, as late
     * as possible in the bootstrap process.
     */
    @memoize()
    checkValid(): boolean {
        // Constructor shouldn't throw.
        if (!isValidKind(this.kind)) {
            throw new InvalidMetadata(`Invalid kind '${this.kind}' for model. Kind must match ${_VALID_KIND_MATCH}`);
        }

        if (this.superType !== undefined) {
            var supertypeMeta = ModelMetadata.forType(this.superType);
            if (!supertypeMeta) {
                throw new InvalidMetadata(`Supertype ${supertypeMeta.kind} must be a model type`);
            }
            if (!supertypeMeta.isAbstract) {
                throw new InvalidMetadata(`Supertype ${supertypeMeta.kind} must be abstract`);
            }
        }
        this.ownProperties.valueSeq().forEach(prop => {
            prop.checkValid(this);
        });

        if (this.properties.filter(prop => prop.key).count() > 2) {
            throw new InvalidMetadata(`Model ${this.type} can have at most one key property`);
        }

        return true;
    }

    getProperty(propNameOrRefName: string): BasePropertyMetadata {
        let propName: string;
        if (this.refNameMap.has(propNameOrRefName)) {
            propName = this.refNameMap.get(propNameOrRefName);
        } else {
            propName = propNameOrRefName;
        }
        if (!this.properties.has(propName)) {
            throw new PropertyNotFoundException(propNameOrRefName, this);
        }
        return this.properties.get(propName);
    }

    toString() { return `ModelMetadata(${this.kind})`}

    get valueAccessors(): Iterable.Keyed<string, Accessor<any>> {
        return this._getValueAccessors();
    }
    @memoize()
    private _getValueAccessors(): Iterable.Keyed<string, Accessor<any>> {
        return this.properties
            .map(property => property.valueAccessor)
            .toKeyedSeq();
    }
}

function buildOwnPropertyMap(type: Type<any>): OrderedMap<string, BasePropertyMetadata> {
    let propArgs = List<{isRef: boolean, args: any[]}>(Reflect.getMetadata('model:properties', type))
        .skipWhile(arg => arg === null /* Ignore args for the supertype */);

    if (propArgs.isEmpty())
        return OrderedMap<string,BasePropertyMetadata>();

    // There is possibly one null at the end, if it is possible to subtype the model.
    // This would be a spread parameter.
    if (propArgs.last() === null) {
        propArgs = propArgs.butLast();
    }

    if (propArgs.some(arg => arg === null)) {
        throw new InvalidMetadata(`The own properties in the parameter list of ${type} must be contiguous`);
    }

    let ownProperties = propArgs.map(({isRef, args}) => {
        if (isRef) {
            return new RefPropertyMetadata(args[0], args[1], args[2], args[3]);
        } else {
            return new PropertyMetadata(args[0], args[1], args[2], args[3]);
        }
    });

    return OrderedMap<string,BasePropertyMetadata>(ownProperties.map(prop => [prop.name, prop]));
}

/**
 * Build a new ModelMetadata instance
 *
 * @param type
 * The type being annotated.
 * @param receiver
 * The proxy that is being built for the type.
 * @returns {ModelMetadata}
 */
export function buildModelMetadata(type: Type<any>, receiver: any): ModelMetadata {

    if (type === ModelBase) {
        return ModelMetadata._modelBaseMetadata;
    }

    if (!Reflect.getMetadata('model:options', type)) {
        throw new ModelNotFoundException(type);
    }

    let options = Reflect.getMetadata('model:options', type);

    if (isDefined(options.superType)) {
        // Replace the value with the proxy
        let superTypeMeta = ModelMetadata.forType(options.superType);
        options.superType = superTypeMeta.type;
    }

    let metadata = new ModelMetadata(receiver, buildOwnPropertyMap(type), options);
    metadata.checkValid();
    return metadata;
}

