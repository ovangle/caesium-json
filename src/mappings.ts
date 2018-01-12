import {Record, Set} from 'immutable';
import {JsonObject} from "./json";
import {Codec, compose, isCodec} from "./codec";
import {objectKeys} from "./utils";

export type CodecMap<T,TObject = JsonObject<keyof T>>
  = {[K in (keyof T & keyof TObject)]: Codec<T[K], TObject[K] | undefined>};

export function isCodecMap<T>(obj: any): obj is CodecMap<T> {
  return !!obj
      && objectKeys(obj).every(key => isCodec(obj[key]));
}


function getCodecMap<T>(codecsOrMap: CodecMap<T> | {codecs: CodecMap<T>}) {
  return isCodecMap<T>(codecsOrMap) ? codecsOrMap : codecsOrMap.codecs;
}

/**
 *
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export function partialObject<T>(
  codecsOrMap: CodecMap<T> | {codecs: CodecMap<T>},
  maybeFactory?: (args: Partial<T>) => Partial<T>
): Codec<Partial<T>, JsonObject<keyof T>> & {codecs: CodecMap<T>} {

  const codecs = getCodecMap(codecsOrMap);
  const propertyKeys = Set<keyof T>(Object.keys(codecs) as Array<keyof T>);
  const factory = maybeFactory ? maybeFactory : function (args: Partial<T>) { return args; }

  return {
    codecs,
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
      let result = <JsonObject<keyof T>>{};

      // TODO: Are objects with a null prototype OK?
      if (maybeFactory === undefined && Object.getPrototypeOf(obj) !== Object.prototype) {
        throw 'If a factory is not provided, object codec can only apply to instances with the prototype'
          + 'Object.prototype (got \'' + Object.getPrototypeOf(obj)
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
    decode: (obj: JsonObject<keyof T>, context?: any) => {
      let result = Object.create(Object.prototype);

      let objKeys = objectKeys(obj);
      propertyKeys.forEach(key => {
        let codec = <Codec<any,any>>codecs[key];
        result[key] = codec.decode(obj[key], context);
      });

      for (let objKey of objKeys) {
        if (!propertyKeys.has(objKey)) {
          throw `No codec provided for '${objKey}'`;
        }
      }

      return factory(result);
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


export function object<T>(
  mapOrCodecs: CodecMap<T> | {codecs: CodecMap<T>},
  maybeFactory?: (args: T) => T
): Codec<T,JsonObject<keyof T>> & {codecs: CodecMap<T>} {
  const codecs = getCodecMap(mapOrCodecs);

  let codecKeys = objectKeys(codecs);
  let baseCodec = compose(
    validatePartial<T>(codecKeys),
    partialObject(codecs, maybeFactory)
  );
  return {
    codecs,
    ...compose(validatePartial(objectKeys(codecs)), partialObject(codecs))
  };
}

export function record<T, TRecord extends Record<T>>(
  ctor: { new (params?: Partial<T>): TRecord },
  map: CodecMap<T> | {codecs: CodecMap<T>}
): Codec<TRecord, JsonObject<keyof T>> & {codecs: CodecMap<T>} {

  const recordToObject: Codec<TRecord, T> = {
    encode: (record: TRecord, context?: any) => record.toObject(),
    decode: (obj: T, context?: any) => new ctor(obj)
  }
  return {
    codecs: getCodecMap(map),
    ...compose(recordToObject, object(map))
  }
}
