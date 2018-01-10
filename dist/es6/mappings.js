import { Set } from 'immutable';
import { compose, isCodec } from "./codec";
import { objectKeys } from "./utils";
export function isCodecMap(obj) {
    return !!obj
        && objectKeys(obj).every(key => isCodec(obj[key]));
}
function getCodecMap(codecsOrMap) {
    return isCodecMap(codecsOrMap) ? codecsOrMap : codecsOrMap.codecs;
}
/**
 *
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export function partialObject(codecsOrMap, maybeFactory) {
    const codecs = getCodecMap(codecsOrMap);
    const propertyKeys = Set(Object.keys(codecs));
    const factory = maybeFactory ? maybeFactory : function (args) { return args; };
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
        encode: (obj, context) => {
            let result = {};
            if (Object.getPrototypeOf(obj) !== Object.prototype) {
                throw `Can only encode objects with the prototype 'Object.prototype'`;
            }
            propertyKeys.intersect(objectKeys(obj)).forEach(key => {
                let codec = codecs[key];
                let encoded = codec.encode(obj[key], context);
                // Drop undefined values from the output
                if (encoded !== undefined) {
                    result[key] = encoded;
                }
            });
            return result;
        },
        decode: (obj, context) => {
            let result = Object.create(Object.prototype);
            let objKeys = objectKeys(obj);
            propertyKeys.intersect(objKeys).forEach(key => {
                let codec = codecs[key];
                result[key] = codec.decode(obj[key], context);
            });
            for (let objKey of objKeys) {
                if (!propertyKeys.has(objKey)) {
                    throw `No codec provided for '${objKey}'`;
                }
            }
            return factory(result);
        }
    };
}
function validatePartial(propKeys) {
    return {
        encode: (input) => input,
        decode: (input) => {
            for (let key of propKeys) {
                if (input[key] === undefined) {
                    throw `No value on object for '${key}'`;
                }
            }
            return input;
        }
    };
}
export function object(mapOrCodecs, factory) {
    const codecs = getCodecMap(mapOrCodecs);
    let codecKeys = objectKeys(codecs);
    let baseCodec = compose(validatePartial(codecKeys), partialObject(codecs));
    return Object.assign({ codecs }, compose(validatePartial(objectKeys(codecs)), partialObject(codecs)));
}
export function record(ctor, map) {
    const recordToObject = {
        encode: (record, context) => record.toObject(),
        decode: (obj, context) => new ctor(obj)
    };
    return Object.assign({ codecs: getCodecMap(map) }, compose(recordToObject, object(map)));
}
