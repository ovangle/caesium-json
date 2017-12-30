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
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export function object(codecs) {
    const propertyKeys = Object.keys(codecs);
    return {
        encode: (obj, context) => {
            let result = {};
            if (Object.getPrototypeOf(obj) !== Object.prototype) {
                throw `Can only encode objects with the prototype 'Object.prototype'`;
            }
            propertyKeys.forEach(key => {
                let codec = codecs[key];
                let encoded = codec.encode(obj[key]);
                // Drop undefined values from the output
                if (encoded !== undefined) {
                    result[key] = encoded;
                }
            });
            return result;
        },
        decode: (obj, context) => {
            let result = Object.create(Object.prototype);
            propertyKeys.forEach(key => {
                let codec = codecs[key];
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
    };
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
    return compose(recordToObject, object(codecs));
}
