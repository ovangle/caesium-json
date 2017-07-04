import { Map, Set } from 'immutable';
import { Type } from 'caesium-core/lang';
import { Codec } from 'caesium-core/codec';
import { ModelBase } from "./base";
import { ModelValues } from './values';
export declare const _RESERVED_PROPERTY_NAMES: Set<string>;
export interface ModelOptions {
    kind: string;
    superType?: Type<any>;
    isAbstract?: boolean;
}
export declare class ModelMetadata<T> {
    static forType<U>(type: Type<U>): ModelMetadata<U>;
    static forInstance<U>(instance: U): ModelMetadata<U>;
    readonly kind: string;
    readonly type: Type<T>;
    readonly superType: Type<any>;
    /**
     * An abstract model cannot be instantiated by a model factory.
     * It is intended to act purely as a supertype for other model types.
     */
    readonly isAbstract: boolean;
    /**
     * All the properties on the metadata.
     */
    readonly ownProperties: Map<string, BasePropertyMetadata>;
    readonly supertypeMeta: ModelMetadata<any>;
    constructor(type: Type<T>, ownProperties: Map<string, BasePropertyMetadata>, options: ModelOptions);
    checkHasPropertyOrRef(propNameOrRefName: string): void;
    readonly properties: Map<string, BasePropertyMetadata>;
    /**
     * A map of refNames to the associated property names.
     * @returns {Map<string, string>}
     */
    readonly refNameMap: Map<string, string>;
    toString(): string;
}
export interface BasePropertyOptions {
    readOnly?: boolean;
    writeOnly?: boolean;
    required?: boolean;
    allowNull?: boolean;
}
export interface PropertyOptions extends BasePropertyOptions {
    defaultValue?: () => any;
    codec: Codec<any, any>;
}
export declare class BasePropertyMetadata {
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
    codec: Codec<any, any>;
    constructor(name: string, options: BasePropertyOptions);
    /**
     * Get the value from the model values
     * @param modelValues
     * @returns {any}
     */
    valueAccessor(modelValues: ModelValues): any;
    /**
     * Initialize the value in the modelValues.
     * @param modelValues
     * @param value
     * Contextual information for the initializer
     * @returns {{initialValues: Map<string, any>, values: Map<string, any>}}
     */
    valueInitializer(modelValues: ModelValues, value: any): ModelValues;
    /**
     * Mutate the value in the modelValues
     *
     * @param modelValues: The current model state
     * @param value: The new value of the property
     * @param context: Context for the mutator
     * @returns ModelValues: The new model state
     */
    valueMutator(modelValues: ModelValues, value: any, modelThis: ModelBase): ModelValues;
}
/**
 * A [PropertyMetadata] represents a model property with a value type, which is always
 * serialized onto the model.
 */
export declare class PropertyMetadata extends BasePropertyMetadata {
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
    static idProperty(modelMetadata: ModelMetadata<any>): PropertyMetadata;
    isRef: boolean;
    isBackRef: boolean;
    /**
     * A function which provides a default value for the property.
     * If `null`, the property has no default value.
     */
    defaultValue: () => any;
    codec: Codec<any, any>;
    constructor(name: string, options: PropertyOptions);
}
export interface RefPropertyOptions extends BasePropertyOptions {
    refName: string;
    refType: Type<any>;
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
export declare class RefPropertyMetadata extends BasePropertyMetadata {
    isRef: boolean;
    isBackRef: boolean;
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
    codec: Codec<any, any>;
    constructor(name: string, options: RefPropertyOptions);
    valueInitializer(modelValues: ModelValues, value: any): ModelValues;
    valueMutator(modelValues: ModelValues, value: any, modelThis: ModelBase): ModelValues;
    /**
     * Gets the resolved value of the reference property.
     * Otherwise returns `undefined`.
     * @param modelValues
     * @returns {any}
     */
    refValueAccessor(modelValues: ModelValues): any;
    private _setIdValue(values, refValue);
    refValueInitializer(modelValues: ModelValues, value: any): ModelValues;
    refValueMutator(modelValues: ModelValues, value: any, modelThis: ModelBase): ModelValues;
}
