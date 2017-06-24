import { EncodingException } from 'caesium-core/codec';
export const stringReversingCodec = {
    encode: (s) => s.split('').reverse().join(''),
    decode: (s) => s.split('').reverse().join('')
};
export const numberIncrementingCodec = {
    encode: (s) => s + 1,
    decode: (s) => s - 1
};
export function expectThrowsOnNullOrUndefined(codec) {
    expect(() => codec.encode(null)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.decode(null)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(EncodingException));
}
