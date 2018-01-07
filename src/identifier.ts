/**
 * A collection of codecs which deal with string case conversions
 */


import {List} from 'immutable';
import {Codec, compose, invert, identity} from './codec';
import {objectKeys} from "./utils";
import {JsonObject} from "./json";


export type PrivacyLevel = number;

export type Word = string;

export interface Identifier {
  // The privacy of the identifier. A number betwe
  privacy: PrivacyLevel;

  // The words of the identifier.
  words: List<Word>;
}

export type IdentifierFormat<K> = Codec<Identifier,keyof K>;

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
export function identifier<K1=any,K2=any>(
    src: IdentifierFormat<K1>,
    dest: IdentifierFormat<K2>
): Codec<keyof K1,keyof K2> {
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
export function rewriteObjectIdentifiers<K1, K2>(
    src: IdentifierFormat<K1>,
    dest: IdentifierFormat<K2>,
): Codec<JsonObject<K1>,JsonObject<K2>> {
  const identifierCodec = identifier<K1,K2>(src, dest);
  return {
    encode: (input: JsonObject<K1>) => {
      let result = <JsonObject<K2>>{};

      for (let prop of objectKeys(input)) {
        let encodedProp = identifierCodec.encode(prop);
        result[encodedProp] = input[prop];
      }

      return result;
    },
    decode: (input: JsonObject<K2>) => {
      let result = <JsonObject<K1>>{};

      for (let prop of objectKeys(input)) {
        let decodedProp = identifierCodec.decode(prop);
        result[decodedProp] = input[prop];
      }
      return result;
    }
  }
}


