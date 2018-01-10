import { List } from "immutable";
export function isCodec(obj) {
    return obj != null
        && typeof obj.encode === 'function'
        && typeof obj.decode === 'function';
}
export function invert(codec) {
    return {
        encode: (input, context) => codec.decode(input, context),
        decode: (input, context) => codec.encode(input, context)
    };
}
export function compose(...codecs) {
    const codecList = List(codecs);
    return {
        encode: (input, context) => codecList.reduce((acc, codec) => codec.encode(acc), input),
        decode: (input, context) => codecList.reduceRight((acc, codec) => codec.decode(acc), input)
    };
}
export function identity() {
    return { encode: (input) => input, decode: (input) => input };
}
;
/**
 * Uses the value stored in the context as identifier
 * in order to supply a codecs value.
 *
 * On encode, the input's value is written to the context identifier,
 * mutating the context.
 *
 * On decode, a value is read from the context.
 * If the contextual value is a function, it is called with no arguments
 * in order to generate a value for the field.
 *
 * @param {string} identifier
 * @returns {Codec<T, undefined>}
 */
export function contextValue(identifier) {
    return {
        encode: (input, context) => {
            return undefined;
        },
        decode: (input, context) => {
            let value = context[identifier];
            if (value === undefined) {
                throw `No value provided for identifier '${identifier}' in context.`;
            }
            if (typeof value === "function") {
                return value();
            }
            else {
                return value;
            }
        }
    };
}
/**
 * Codec which bottoms out with an exception on encode and decode.
 * @type {{encode: ((_) => any); decode: ((_) => any)}}
 */
export const error = {
    encode: (_) => {
        throw new Error('A codec was not provided');
    },
    decode: (_) => {
        throw new Error('A codec was not provided');
    }
};
