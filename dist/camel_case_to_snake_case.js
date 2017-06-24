/**
 * Utility converter for converting camelCase strings into snake_case.
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
import { EncodingException } from 'caesium-core/codec';
const _MATCH_SNAKE_CASE = /^_*([a-z]+_)*([a-z]+)$/;
const _REPLACE_SNAKE_CASE = /([a-z])_([a-z])/g;
const _MATCH_CAMEL_CASE = /^_*[a-z]+([A-Z][a-z]+)*$/;
const _REPLACE_CAMEL_CASE = /([a-z])([A-Z])/g;
export const camelCaseToSnakeCase = {
    encode: (input) => {
        if (!input.match(_MATCH_CAMEL_CASE))
            throw new EncodingException(`${input} is not in camel case. Must match ${_MATCH_CAMEL_CASE}`);
        return input.replace(_REPLACE_CAMEL_CASE, (match, p1, p2) => `${p1}_${p2.toLowerCase()}`);
    },
    decode: (input) => {
        if (!input.match(_MATCH_SNAKE_CASE))
            throw new EncodingException(`${input} is not in snake_case. Must match ${_MATCH_SNAKE_CASE}`);
        return input.replace(_REPLACE_SNAKE_CASE, (match, p1, p2) => p1 + p2.toUpperCase());
    }
};
