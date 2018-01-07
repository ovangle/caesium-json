/**
 * A collection of codecs which deal with string case conversions
 */
import { List } from 'immutable';
import { Codec } from './codec';
import { JsonObject } from "./json";
export declare type PrivacyLevel = number;
export declare type Word = string;
export interface Identifier {
    privacy: PrivacyLevel;
    words: List<Word>;
}
export declare type IdentifierFormat<K> = Codec<Identifier, keyof K>;
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
export declare function identifier<K1 = any, K2 = any>(src: IdentifierFormat<K1>, dest: IdentifierFormat<K2>): Codec<keyof K1, keyof K2>;
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
export declare function rewriteObjectIdentifiers<K1, K2>(src: IdentifierFormat<K1>, dest: IdentifierFormat<K2>): Codec<JsonObject<K1>, JsonObject<K2>>;
