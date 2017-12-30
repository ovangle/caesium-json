import { List } from 'immutable';
import { Identifier } from './identifier';
/**
 * - PrivacyLevel is indicated by a lower undercore prefix
 * - Words are strictly lower case, except for upper case words
 * - Words are joined by a single underscore letter.
 *
 * - A word is capitalized if at least one letter is capitalized.
 *
 * eg:
 *   __the_little_BROWN_fox:   privacy 2, words: ['the', 'little', 'BROWN', 'fox']
 *   __the_little_Brown_fox:   privacy 2, words: ['the', 'little', 'BROWN', fox']
 *   the_little_fox: privacy 0, words: ['the', 'little', 'fox']
 */
export declare const underscoreCase: {
    decode(input: string): Identifier;
    encode(identifier: Identifier): string;
};
/**
 * Words similarly to UnderscoreCase except with dashes
 */
export declare const snakeCase: {
    decode(input: string): {
        privacy: number;
        words: List<string>;
    };
    encode(identifier: Identifier): string;
};
/**
 * The `UpperCamelCase` identifier format
 * - Privacy level is indicated by optional leading underscores
 *   e.g. __HelloWorld has privacy 2
 * - Words are separated by the following capital letter and lowercased,
 *   _unless_ a consecutive group of capital letters is encountered, in which case
 *   they are emitted as the capital word.
 *   e.g. SimpleHTTPResponse would be words ['simple', 'HTTP', 'response']
 */
export declare const upperCamelCase: {
    decode(input: string): {
        privacy: number;
        words: List<string>;
    };
    encode(input: Identifier): string;
};
/**
 * Same as UpperCamelCase, except that the first letter of the identifier
 * is always lower case.
 */
export declare const lowerCamelCase: {
    decode(input: string): {
        privacy: number;
        words: List<string>;
    };
    encode(input: Identifier): string;
};
