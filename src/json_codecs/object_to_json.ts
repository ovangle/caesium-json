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
import {Iterable} from 'immutable';
import {isBlank, isDefined} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';

import {JsonObject} from './interfaces';
import {EncodingException} from './exceptions';
import {camelCaseToSnakeCase} from './string_case_converters';


export function objectToJson<T>(
    encodeProperties: Iterable<any,string>,
    valueEncoder: (propName: string) => Converter<any,any>
): Converter<T,JsonObject> {
    return (input: T) => {
        if (isBlank(input))
            return input as any;

        var jsonObject: {[propName: string]: any} = {};
        encodeProperties.forEach((propName) => {
            var encoder = valueEncoder(propName);

            var entryName = camelCaseToSnakeCase(propName);

            if (isBlank(encoder))
                throw new EncodingException(`No encoder for ${propName}`);

            var value = (input as any)[propName];
            var encodedValue = encoder(value);

            // Drop undefined values from output
            if (isDefined(encodedValue))
                jsonObject[entryName] = encodedValue;
        });

        return jsonObject;
    };
}

export function jsonToObject<T>(
    encodeProperties: Iterable<any,string>,
    valueDecoder: (propName: string) => Converter<any,any>,
    factory: (values: {[propName: string]: any}) => T
): Converter<JsonObject,T> {
    return (jsonObject: JsonObject) => {
        if (isBlank(jsonObject))
            return jsonObject as any;

        var factoryArgs: {[propName: string]: any} = {};
        encodeProperties.forEach((propName) => {
            var entryName = camelCaseToSnakeCase(propName);
            var value = jsonObject[entryName];

            var decoder = valueDecoder(propName);
            if (isBlank(decoder))
                throw new EncodingException(`No decoder for ${propName}`);

            factoryArgs[propName] = decoder(value);
        });

        return factory(factoryArgs);
    };
}
