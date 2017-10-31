import { List } from "immutable";
export function isCodec(obj) {
    return obj != null
        && typeof obj.encode === 'function'
        && typeof obj.decode === 'function';
}
export function invert(codec) {
    return {
        encode: (input) => codec.decode(input),
        decode: (input) => codec.encode(input)
    };
}
export function compose(codec_a, codec_b) {
    return {
        encode: (input) => codec_b.encode(codec_a.encode(input)),
        decode: (input) => codec_a.decode(codec_b.decode(input))
    };
}
export function identity() {
    return { encode: (input) => input, decode: (input) => input };
}
;
export function nullable(codec) {
    return {
        encode: (input) => input != null ? codec.encode(input) : null,
        decode: (input) => input != null ? codec.decode(input) : null
    };
}
export function array(codec) {
    return {
        encode: (input) => input.map((item) => codec.encode(item)),
        decode: (input) => input.map((item) => codec.decode(item))
    };
}
const listToArray = {
    encode: (input) => input.toArray(),
    decode: (input) => List(input)
};
export function list(codec) {
    return compose(listToArray, array(codec));
}
export function map(codec) {
    return {
        encode: (input) => input.map(codec.encode).toMap(),
        decode: (input) => input.map(codec.decode).toMap()
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
