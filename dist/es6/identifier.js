/**
 * A collection of codecs which deal with string case conversions
 */
import { compose, invert } from './codec';
import { objectKeys } from "./utils";
/**
 * - PrivacyLevel is indicated by a lower undercore prefix
 * - Words are strictly lower case, except for upper case words
 * - Words are joined by a single underscore letter.
 *
 *
 * @param {IdentifierFormat} src
 * @param {IdentifierFormat} dest
 * @returns {Codec<string, string>}
 */
export function identifier(src, dest) {
    return compose(invert(src), dest);
}
/**
 * Writes a new object, replacing the keys on an input object (whose keys match the source format)
 * into an object with keys in the output identifier format.
 *
 * e.g.
 * given the codec
 *
 *  codec = rewriteObjectIdentifiers(snakeCase, upperCamelCase)
 *
 * the object `{--variable-name: '420'}` would be encoded as `{__VariableName: '420'}`
 *
 *
 * @param {IdentifierFormat<T>} src
 * @param {IdentifierFormat<any>} dest
 * @returns {Codec<T, {[p: string]: any}>}
 */
export function rewriteObjectIdentifiers(src, dest) {
    const identifierCodec = identifier(src, dest);
    return {
        encode: (input) => {
            let result = {};
            for (let prop of objectKeys(input)) {
                let encodedProp = identifierCodec.encode(prop);
                result[encodedProp] = input[prop];
            }
            return result;
        },
        decode: (input) => {
            let result = {};
            for (let prop of objectKeys(input)) {
                let decodedProp = identifierCodec.decode(prop);
                result[decodedProp] = input[prop];
            }
            return result;
        }
    };
}
