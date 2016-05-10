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
import {isBlank, isDefined, forEachOwnProperty, Type} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';

import {JsonObject} from './interfaces';
import {EncodingException} from '../exceptions';
import {snakeCaseToCamelCase, camelCaseToSnakeCase} from './string_case_converters';


export function objectToJson<T>(
    valueEncoder: (propName: string) => Converter<any,any>
): Converter<T,JsonObject> {
    function _encodePropertyValue(propName: string, value: any): {name: string, value: any} {
        var encoder = valueEncoder(propName);
        var key = camelCaseToSnakeCase(propName);
        return {name: key, value: encoder(value)};
    }

    return (input: T) => {
        if (isBlank(input))
            return input as any;

        var record: {[propName: string]: any} = {};
        forEachOwnProperty(input, (value, propName) => {
            var encoded = _encodePropertyValue(propName, value);

            // Drop undefined values from output
            if (isDefined(encoded.value)) {
                record[encoded.name] = encoded.value;
            }
        });

        return record;
    };
}

export function jsonToObject<T>(
    valueDecoder: (propName: string) => Converter<any,any>,
    factory: (values: {[propName: string]: any}) => T
): Converter<JsonObject,T> {

    function _encodeEntryValue(key: string, value: any): {name: string, value: any} {
        var propName = snakeCaseToCamelCase(key);
        var decoder = valueDecoder(propName);
        if (isBlank(decoder)) {
            throw new EncodingException(`No decoder for ${propName}`);
        }
        return {name: propName, value: decoder(value)};
    }

    return (record: JsonObject) => {
        if (isBlank(record))
            return record as any;

        var obj: {[propName: string]: any} = {};
        forEachOwnProperty(record, (value, key) => {
            var encoded = _encodeEntryValue(key, value);
            obj[encoded.name] = encoded.value;
        });

        return factory(obj);
    };
}
