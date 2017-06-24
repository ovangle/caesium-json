"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codec_1 = require("caesium-core/codec");
exports.stringReversingCodec = {
    encode: (s) => s.split('').reverse().join(''),
    decode: (s) => s.split('').reverse().join('')
};
exports.numberIncrementingCodec = {
    encode: (s) => s + 1,
    decode: (s) => s - 1
};
function expectThrowsOnNullOrUndefined(codec) {
    expect(() => codec.encode(null)).toThrow(jasmine.any(codec_1.EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(codec_1.EncodingException));
    expect(() => codec.decode(null)).toThrow(jasmine.any(codec_1.EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(codec_1.EncodingException));
}
exports.expectThrowsOnNullOrUndefined = expectThrowsOnNullOrUndefined;
