import {Codec} from './codec';
import {List} from 'immutable';

export const stringReversingCodec = {
    encode: (s: string) => s.split('').reverse().join(''),
    decode: (s: string) => s.split('').reverse().join('')
}

export const numberIncrementingCodec = {
    encode: (s: number) => s + 1,
    decode: (s: number) => s - 1
};

export function expectThrowsOnNullOrUndefined(codec: Codec<any,any>) {
    expect(() => codec.encode(null)).toThrow(jasmine.any(Error));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(Error));
    expect(()=> codec.decode(null)).toThrow(jasmine.any(Error));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(Error));
}

