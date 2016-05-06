/**
 * Utility converter for converting camelCase strings into snake_case.
 * Not intended to be used outside this module.
 * The definitions of snake case and camel case are a little limited.
 *
 * camelCase is any string which
 *      - optionally begins with leading '_' characters. These are preserved by the conversion
 *      - the first non-underscore character must be a lower case letter.
 *      - must contain no non-alphabetic characters
 *      - Every capital letter must be followed by a lower case letter.
 *
 * snake_case is any string which
 *      - optionally begins with leading '_' characters.
 *        These are preserved by the conversion
 *      - only contains lower case letters and underscores.
 *      - must contain at least one lower case letter
 *      - every underscore (except leading underscores')
 *        must be between two letters
 */
import {Converter} from 'caesium-core/converter';
import {Try, success, failure} from 'caesium-core/try';
import {EncodingException} from '../exceptions';

const _MATCH_SNAKE_CASE =  /^_*([a-z]+_)*([a-z]+)$/;
const _REPLACE_SNAKE_CASE = /([a-z])_([a-z])/g;

const _MATCH_CAMEL_CASE = /^_*[a-z]+([A-Z][a-z]+)*$/;
const _REPLACE_CAMEL_CASE = /([a-z])([A-Z])/g;

export function snakeCaseToCamelCase(input: string): string {
    if (!input.match(_MATCH_SNAKE_CASE))
        throw new EncodingException(
            `${input} is not in snake_case. Must match ${_MATCH_SNAKE_CASE}`
        );
    return input.replace(
        _REPLACE_SNAKE_CASE,
        (match: string, p1:string, p2:string) => p1 + p2.toUpperCase()
    );
}


export function camelCaseToSnakeCase(input: string): string {
    if (!input.match(_MATCH_CAMEL_CASE))
        throw new EncodingException(
            `${input} is not in camel case. Must match ${_MATCH_CAMEL_CASE}`
        );
    return input.replace(
        _REPLACE_CAMEL_CASE,
        (match:string, p1:string, p2:string) => `${p1}_${p2.toLowerCase()}`
    );
}




