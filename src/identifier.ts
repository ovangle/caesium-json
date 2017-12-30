/**
 * A collection of codecs which deal with string case conversions
 */


import {List} from 'immutable';
import {Codec, compose, invert, identity} from './codec';
import {objectKeys} from "./utils";


export type PrivacyLevel = number;

export type Word = string;

export interface Identifier {
  // The privacy of the identifier. A number betwe
  privacy: PrivacyLevel;

  // The words of the identifier.
  words: List<Word>;
}

export type IdentifierFormat<K extends string = string> = Codec<Identifier,K>;

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
export function identifier<K1 extends string = string,K2 extends string = string>(
    src: IdentifierFormat<K1>,
    dest: IdentifierFormat<K2>
): Codec<K1,K2> {
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
export function rewriteObjectIdentifiers<K1 extends string = string, K2 extends string = string, V = any>(
    src: IdentifierFormat<K1>,
    dest: IdentifierFormat<K2>,
): Codec<{[k in K1]: V}, {[k in K2]: V}> {
  const identifierCodec = identifier<K1,K2>(src, dest);
  return {
    encode: (input: {[k in K1]: V}) => {
      let result = <{[k in K2]: V}> {};

      for (let prop of objectKeys(input)) {
        let encodedProp = identifierCodec.encode(prop);
        result[encodedProp] = input[prop];
      }

      return result;
    },
    decode: (input: {[k in K2]: V}) => {

      let result = <{[k in K1]: V}> {};

      for (let prop of objectKeys(input)) {
        let decodedProp = identifierCodec.decode(prop);
        result[decodedProp] = input[prop];
      }
      return result;
    }
  }
}


