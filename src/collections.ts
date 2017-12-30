import {List, Map, Record, Set} from 'immutable';
import {Codec, compose} from "./codec";
import {identifier, IdentifierFormat} from "./identifier";
import {objectKeys} from "./utils";

export function array<T,U>(codec: Codec<T,U>): Codec<Array<T>,Array<U>> {
  return {
    encode: (input: Array<T>, context?: any) => input.map((item) => codec.encode(item, context)),
    decode: (input: Array<U>, context?: any) => input.map((item) => codec.decode(item, context))
  }
}

const listToArray: Codec<List<any>,Array<any>> = {
  encode: (input) => input.toArray(),
  decode: (input) => List(input)
}

export function list<T,U>(codec: Codec<T,U>): Codec<List<T>, Array<U>> {
  return compose(listToArray, array(codec));
}

const setToArray: Codec<Set<any>,Array<any>> = {
  encode: (input) => input.toArray(),
  decode: (input) => Set(input)
}

export function set<T,U>(codec: Codec<T,U>): Codec<Set<T>,Array<U>> {
  return compose(setToArray, array(codec));
}

/**
 * Encodes an arbitrary object as a
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export function object<T>(
  codecs: {[K in keyof T]?: Codec<T[K], any>}
): Codec<T, {[K in keyof T]: any}> {
  const propertyKeys = Object.keys(codecs) as Array<keyof T>;

  return {
    encode: (obj: T, context?: any) => {
      let result = <{[K in keyof T]: any}>{};

      if (Object.getPrototypeOf(obj) !== Object.prototype) {
        throw `Can only encode objects with the prototype 'Object.prototype'`;
      }

      propertyKeys.forEach(key => {
        let codec = <Codec<any,any>>codecs[key];
        let encoded = codec.encode(obj[key]);
        // Drop undefined values from the output
        if (encoded !== undefined) {
          result[key] = encoded;
        }
      });

      return result;
    },
    decode: (obj: {[K in keyof T]: any}, context?: any) => {
      let result = <T>Object.create(Object.prototype);

      propertyKeys.forEach(key => {
        let codec = <Codec<any,any>>codecs[key];
        result[key] = codec.decode(obj[key], context);
      });

      let objKeys = objectKeys(obj);
      for (let objKey of objKeys) {
        if (propertyKeys.every(propKey => propKey !== objKey)) {
          throw `No codec provided for '${objKey}'`;
        }
      }

      return result;
    }
  }
}

export function map<K, V1, V2>(codec: Codec<V1,V2>): Codec<Map<K,V1>,Map<K,V2>> {
  return {
    encode: (input, context?: any) => input.map((value) => codec.encode(value, context)).toMap(),
    decode: (input, context?: any) => input.map((value) => codec.decode(value, context)).toMap()
  }
}

export function record<TProps, U extends Record<TProps>>(
  ctor: {new (params?: Partial<TProps>): U},
  codecs: {[K in keyof TProps]: Codec<TProps[K], any>}
): Codec<U, {[K in keyof TProps]: any}> {
  const recordToObject: Codec<U, {[K in keyof TProps]: TProps[K]}> = {
    encode: (record: U, context?: any) => record.toObject(),
    decode: (obj: {[K in keyof TProps]: TProps[K]}, context?: any) => new ctor(obj)
  }
  return compose(recordToObject, object(codecs));
}

