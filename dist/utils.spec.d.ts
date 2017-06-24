import { Codec } from 'caesium-core/codec';
export declare const stringReversingCodec: {
    encode: (s: string) => string;
    decode: (s: string) => string;
};
export declare const numberIncrementingCodec: {
    encode: (s: number) => number;
    decode: (s: number) => number;
};
export declare function expectThrowsOnNullOrUndefined(codec: Codec<any, any>): void;
