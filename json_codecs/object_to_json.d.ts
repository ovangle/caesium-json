/**
 * Converts an arbitrary javascript object into a 'record'.
 *
 * For our purposes an object:
 * - Is a mapping of property names to arbitrary values
 * - always has property names in camelCase
 *
 * And a record:
 * - Is a mapping of keys to arbitrary values
 * - keys are always in snake_case
 * - has no methods other than those on `Object.prototype`
 *
 * The `valueConverter` is a converter for a given property name.
 * The property name is always assumed to be the camelCase attribute
 * on the Object's type.
 */
import { Iterable } from 'immutable';
import { Converter } from 'caesium-core/converter';
import { JsonObject } from './interfaces';
export declare function objectToJson<T>(encodeProperties: Iterable<any, string>, valueEncoder: (propName: string) => Converter<any, any>): Converter<T, JsonObject>;
export declare function jsonToObject<T>(encodeProperties: Iterable<any, string>, valueDecoder: (propName: string) => Converter<any, any>, factory: (values: {
    [propName: string]: any;
}) => T): Converter<JsonObject, T>;
