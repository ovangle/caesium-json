import {Codec, EncodingException} from 'caesium-core/codec';

export const stringReversingCodec = {
    encode: (s: string) => s.split('').reverse().join(''),
    decode: (s: string) => s.split('').reverse().join('')
}

export const numberIncrementingCodec = {
    encode: (s: number) => s + 1,
    decode: (s: number) => s - 1
};

export function expectThrowsOnNullOrUndefined(codec: Codec<any,any>) {
    expect(() => codec.encode(null)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(EncodingException));
    expect(()=> codec.decode(null)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(EncodingException));
}
