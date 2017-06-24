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
import { Codec } from 'caesium-core/codec';
export declare const camelCaseToSnakeCase: Codec<string, string>;
