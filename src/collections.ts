import {List, Map, Record, Set} from 'immutable';
import {Codec, compose} from "./codec";
import {identifier, IdentifierFormat} from "./identifier";
import {objectKeys} from "./utils";
import {Json, JsonObject} from "./json";

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

export type CodecMap<T,TObject extends JsonObject<T>>
  = {[K in (keyof T & keyof TObject)]: Codec<T[K],TObject[K] | undefined>};

/**
 * Encodes an arbitrary object as a
 *
 *
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export function partialObject<T, TObject extends JsonObject<T> = JsonObject<T>>(
  codecs: CodecMap<T,TObject>
): (Codec<Partial<T>, TObject> & CodecMap<T,TObject>) {

  const propertyKeys = Set<keyof T>(Object.keys(codecs) as Array<keyof T>);

  return {
    ...(codecs as any),
    /**
     * Encodes the object as a mapping.
     *
     * If 'includeKeys' is in the context and is an array or immutable collection
     * of object keys, then only the keys specified will be included in the encoded
     * output.
     *
     * @param {T} obj
     * @param context
     * @returns {{[K in keyof T]: any}}
     */
    encode: (obj: Partial<T>, context?: any) => {
      let result = <TObject>{};

      if (Object.getPrototypeOf(obj) !== Object.prototype) {
        throw `Can only encode objects with the prototype 'Object.prototype'`;
      }

      propertyKeys.intersect(objectKeys(obj)).forEach(key => {
        let codec = <Codec<any, any>>codecs[key];
        let encoded = codec.encode(obj[key], context);
        // Drop undefined values from the output
        if (encoded !== undefined) {
          result[key] = encoded;
        }
      });

      return result;
    },
    decode: (obj: JsonObject<T>, context?: any) => {
      let result = <T>Object.create(Object.prototype);

      let objKeys = objectKeys(obj);

      propertyKeys.intersect(objKeys).forEach(key => {
        let codec = <Codec<any,any>>codecs[key];
        result[key] = codec.decode(obj[key], context);
      });

      for (let objKey of objKeys) {
        if (propertyKeys.every(propKey => propKey !== objKey)) {
          throw `No codec provided for '${objKey}'`;
        }
      }

      return result;
    }
  }
}

function validatePartial<T>(propKeys: Iterable<keyof T>): Codec<T, Partial<T>> {
  return {
    encode: (input: T) => input,
    decode: (input: Partial<T>) => {
      for (let key of propKeys) {
        if (input[key] === undefined) {
          throw `No value on object for '${key}'`;
        }
      }
      return <T>input;
    }
  }
}


export function object<T, TObject extends JsonObject<T> = JsonObject<T>>(
  codecs: CodecMap<T,TObject>
): Codec<T,TObject> & CodecMap<T,TObject> {
  let baseCodec = compose(
    validatePartial<T>(objectKeys(codecs)),
    partialObject(codecs)
  );
  return {
    ...(codecs as any),
    ...compose(validatePartial(objectKeys(codecs)), partialObject(codecs))
  };
}


export function map<K, V1, V2>(codec: Codec<V1,V2>): Codec<Map<K,V1>,Map<K,V2>> {
  return {
    encode: (input, context?: any) => input.map((value) => codec.encode(value, context)).toMap(),
    decode: (input, context?: any) => input.map((value) => codec.decode(value, context)).toMap()
  }
}

export function record<T, TRecord extends Record<T>, TObject extends JsonObject<T>>(
  ctor: { new (params?: Partial<T>): TRecord },
  codecs: CodecMap<T,TObject>
): Codec<TRecord, TObject> & CodecMap<T,TObject> {
  const recordToObject: Codec<TRecord, T> = {
    encode: (record: TRecord, context?: any) => record.toObject(),
    decode: (obj: T, context?: any) => new ctor(obj)
  }
  return {
    ...(codecs as any),
    ...compose(recordToObject, object(codecs))
  }
}

