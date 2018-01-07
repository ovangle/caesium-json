import { List, Set } from 'immutable';
import { compose } from "./codec";
import { objectKeys } from "./utils";
export function array(codec) {
    return {
        encode: (input, context) => input.map((item) => codec.encode(item, context)),
        decode: (input, context) => input.map((item) => codec.decode(item, context))
    };
}
const listToArray = {
    encode: (input) => input.toArray(),
    decode: (input) => List(input)
};
export function list(codec) {
    return compose(listToArray, array(codec));
}
const setToArray = {
    encode: (input) => input.toArray(),
    decode: (input) => Set(input)
};
export function set(codec) {
    return compose(setToArray, array(codec));
}
/**
 * Encodes an arbitrary object as a
 *
 *
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export function partialObject(codecs) {
    const propertyKeys = Set(Object.keys(codecs));
    return Object.assign({}, codecs, { 
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
        }, decode: (obj, context) => {
            let result = Object.create(Object.prototype);
            let objKeys = objectKeys(obj);
            propertyKeys.intersect(objKeys).forEach(key => {
                let codec = codecs[key];
                result[key] = codec.decode(obj[key], context);
            });
            for (let objKey of objKeys) {
                if (propertyKeys.every(propKey => propKey !== objKey)) {
                    throw `No codec provided for '${objKey}'`;
                }
            }
            return result;
        } });
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
export function object(codecs) {
    let baseCodec = compose(validatePartial(objectKeys(codecs)), partialObject(codecs));
    return Object.assign({}, codecs, compose(validatePartial(objectKeys(codecs)), partialObject(codecs)));
}
export function map(codec) {
    return {
        encode: (input, context) => input.map((value) => codec.encode(value, context)).toMap(),
        decode: (input, context) => input.map((value) => codec.decode(value, context)).toMap()
    };
}
export function record(ctor, codecs) {
    const recordToObject = {
        encode: (record, context) => record.toObject(),
        decode: (obj, context) => new ctor(obj)
    };
    return Object.assign({}, codecs, compose(recordToObject, object(codecs)));
}
