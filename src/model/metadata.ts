import {OrderedMap, Set, List, Map, Iterable} from 'immutable';


import {forwardRef, resolveForwardRef} from '@angular/core';

import {Type, isBlank, isDefined} from 'caesium-core/lang';
import {memoize} from 'caesium-core/decorators';
import {Codec, identity} from 'caesium-core/codec';

import {InvalidMetadata, ModelNotFoundException, PropertyNotFoundException, ArgumentError} from './exceptions';
import {num} from '../json_codecs';

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

let _typeCache = new WeakMap<Type,ModelMetadata>();


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
    valueAccessor: Accessor<this>;

    constructor(public modelType: Type, public name: string, public type: Type, options: BasePropertyOptions) {
        this.name = name;

        this.readOnly = options.readOnly;
        this.writeOnly = options.writeOnly;
        this.required = options.required;
        this.allowNull = options.allowNull;
        this.isMulti = options.isMulti;
    }

    /**
     * Check that the metadata is valid
     * @param modelMetadata
     * The metadata of the model that this property belongs to.
     * @param propName
     * The property name on the model instance.
     */
    checkValid(modelMetadata: ModelMetadata): void {
        //TODO: This check is incorrect (however, it doesn't matter at the moment).
        // Need to do a property check when we change how ref properties work.

        if (!isDefined(this.codec) && !this.isMulti && this.type === Object) {
            throw new InvalidMetadata(
                `Could not resolve the type of property ${this.name}. ` +
                `If the property is not a primitive type, a List, a Date or a subtype of ModelBase` +
                `then a specific codec needs to be provided in the property options.`
            );
        }

        if (_RESERVED_PROPERTY_NAMES.contains(this.name))
            throw new InvalidMetadata(`${this.name} is a reserved name and cannot be the name of a property`);
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
   static idProperty(name?: string) {
        name = name || 'id';
        let _idPropertyOptions = Object.assign({}, defaultPropertyOptions, {
            codec: num, readOnly: true, allowNull: true, required: false,
            defaultValue: () => null
        });

        return new PropertyMetadata(ModelBase, name, Number, _idPropertyOptions);
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

    constructor(modelType: Type, name: string, paramType: Type, options: PropertyOptions) {
        super(modelType, name, paramType, options);
        this.defaultValue = options.defaultValue;
        this.codec = options.codec;
        this.valueAccessor = <Accessor<this>>new ValueAccessor(this);
        Object.freeze(this);
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
    refType: Type;

    defaultValue: () => null;

    codec = identity;

    isMulti: boolean;

    constructor(modelType: Type, name: string, type: Type, options: RefPropertyOptions) {
        super(modelType, name, type, options);

        this.refName = options.refName;
        if (!isDefined(options.refType)) {
            throw new ArgumentError('Cannot resolve refType. Try a forwardRef');
        }
        this.refType = options.refType;
        this.isMulti = options.isMulti;

        this.valueAccessor = <any>new RefAccessor(this, PropertyMetadata.idProperty(this.name));
        Object.freeze(this);
    }
}

export class ModelMetadata {

    static forType(type: Type): ModelMetadata {
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
        OrderedMap <string, PropertyMetadata>([
            ['id', PropertyMetadata.idProperty()]
        ]),
        { kind: 'core::ModModelBase' /* TODO: Get rid of fucking kind. */}
    );

    kind: string;

    /**
     * The annotated type of the model.
     */
    type: Type;

    /// Basic support for model extensions.
    superType: Type;
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
    ownProperties: OrderedMap<string,PropertyMetadata>;

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

    constructor(
        type: Type,
        ownProperties: OrderedMap<string,PropertyMetadata>,
        options: ModelOptions
    ) {
        this.type = type && resolveForwardRef(type);
        this.kind = options.kind;
        this.ownProperties = ownProperties;

        this.superType = options.superType;
        this.isAbstract = !!options.isAbstract;
    }

    checkValid() {
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
    }

    getProperty(propNameOrRefName: string): PropertyMetadata {
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


    checkHasPropertyOrRef(propNameOrRefName: string): void {
        var hasProperty = this.properties.has(propNameOrRefName)
            || this.refNameMap.has(propNameOrRefName);
        if (!hasProperty) {
            throw new PropertyNotFoundException(propNameOrRefName, this);
        }
    }


    toString() { return `ModelMetadata(${this.kind})`}

    get valueAccessors(): Iterable.Keyed<string, ValueAccessor> {
        return this._getValueAccessors();
    }
    @memoize()
    private _getValueAccessors(): Iterable.Keyed<string, ValueAccessor> {
        return this.properties
            .map(property => property.valueAccessor)
            .toKeyedSeq();
    }
}


function buildOwnPropertyMap(type: Type): OrderedMap<string, BasePropertyMetadata> {
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

export function buildModelMetadata(type: Type, typeProxy?: any): ModelMetadata {

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

    let metadata = new ModelMetadata(typeProxy, buildOwnPropertyMap(type), options);
    metadata.checkValid();
    return metadata;
}

