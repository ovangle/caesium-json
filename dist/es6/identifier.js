/**
 * A collection of codecs which deal with string case conversions
 */
import { List } from 'immutable';
import { compose, invert } from './codec';
const leadingUnderscores = {
    decode: (input) => input.match(/^_*/)[0].length,
    encode: (input) => new Array(input + 1).join('_')
};
const leadingDashes = {
    decode: (input) => input.match(/^-*/)[0].length,
    encode: (input) => new Array(input + 1).join('-')
};
export function codec(src, dest) {
    return compose(invert(src), dest);
}
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
export const underscoreCase = {
    decode(input) {
        let privacy = leadingUnderscores.decode(input);
        input = input.substr(privacy);
        let words = List(input.split(/_/))
            .filter(word => word.length > 0)
            .map(word => /[A-Z]/.test(word) ? word.toUpperCase() : word)
            .toList();
        return { privacy, words };
    },
    encode(identifier) {
        return leadingUnderscores.encode(identifier.privacy) + identifier.words.join('_');
    }
};
/**
 * Words similarly to UnderscoreCase except with dashes
 */
export const snakeCase = {
    decode(input) {
        let privacy = leadingDashes.decode(input);
        input = input.substr(privacy);
        let words = List(input.split(/[-]/))
            .filter(word => word.length > 0)
            .map(word => /[A-Z]/.test(word) ? word.toUpperCase() : word)
            .toList();
        return { privacy, words };
    },
    encode(identifier) {
        return leadingDashes.encode(identifier.privacy) + identifier.words.join('-');
    }
};
function parseCamelCaseWords(input) {
    let words = List(input.split(/(?=[A-Z])/));
    let remainingWords = words;
    return words.flatMap(word => {
        // The above regex will match SimpleHTTPRequest as ['Simple', 'H', 'T', 'T', 'P', 'Request']
        // This merges contiguous groups of single letter words and lower cases the multi-letter words,
        // yielding ['simple', 'HTTP', 'request']
        if (word.length <= 1)
            return [];
        let currWords = [];
        let preceedingCapitals = remainingWords.takeWhile(word => word.length === 1);
        if (!preceedingCapitals.isEmpty()) {
            remainingWords = remainingWords.skip(preceedingCapitals.count());
            currWords.push(preceedingCapitals.join(''));
        }
        remainingWords = remainingWords.skip(1);
        currWords.push(word.toLowerCase());
        return currWords;
    });
}
/**
 * The `UpperCamelCase` identifier format
 * - Privacy level is indicated by optional leading underscores
 *   e.g. __HelloWorld has privacy 2
 * - Words are separated by the following capital letter and lowercased,
 *   _unless_ a consecutive group of capital letters is encountered, in which case
 *   they are emitted as the capital word.
 *   e.g. SimpleHTTPResponse would be words ['simple', 'HTTP', 'response']
 */
export const upperCamelCase = {
    decode(input) {
        let privacy = leadingUnderscores.decode(input);
        input = input.substr(privacy);
        let words = parseCamelCaseWords(input);
        return { privacy, words };
    },
    encode(input) {
        let camelWords = input.words
            .map(word => word[0].toUpperCase() + word.substr(1));
        console.log('identifier', input);
        let leading = leadingUnderscores.encode(input.privacy);
        console.log('leading underscores', leading);
        return leadingUnderscores.encode(input.privacy) + camelWords.join('');
    }
};
/**
 * Same as UpperCamelCase, except that the first letter of the identifier
 * is always lower case.
 */
export const lowerCamelCase = {
    decode(input) {
        let privacy = leadingUnderscores.decode(input);
        input = input.substr(privacy);
        let words = parseCamelCaseWords(input);
        return { privacy, words };
    },
    encode(input) {
        let camelWords = input.words
            .map((word, index) => {
            if (index === 0) {
                // Don't upper case the first word.
                return word;
            }
            return word[0].toUpperCase() + word.substr(1);
        });
        return leadingUnderscores.encode(input.privacy) + camelWords.join('');
    }
};
