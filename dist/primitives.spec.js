"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codec_1 = require("caesium-core/codec");
const primitives_1 = require("./primitives");
function expectThrowsOnNullOrUndefined(codec) {
    expect(() => codec.encode(null)).toThrow(jasmine.any(codec_1.EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(codec_1.EncodingException));
    expect(() => codec.decode(null)).toThrow(jasmine.any(codec_1.EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(codec_1.EncodingException));
}
exports.expectThrowsOnNullOrUndefined = expectThrowsOnNullOrUndefined;
describe('primitives', () => {
    describe('str', () => {
        it('should throw on null or undefined', () => {
            expectThrowsOnNullOrUndefined(primitives_1.str);
        });
        it('should return argument unchanged', () => {
            expect(primitives_1.str.encode('hello')).toBe('hello');
            expect(primitives_1.str.decode('world')).toBe('world');
        });
    });
    describe('num', () => {
        it('should throw on null or undefined ', () => {
            expectThrowsOnNullOrUndefined(primitives_1.num);
        });
        it('should return argument unchanged', () => {
            expect(primitives_1.num.encode(42)).toBe(42);
            expect(primitives_1.num.decode(128)).toBe(128);
        });
    });
    describe('bool', () => {
        it('should throw on null or undefined ', () => {
            expectThrowsOnNullOrUndefined(primitives_1.bool);
        });
        it('should return argument unchanged', () => {
            expect(primitives_1.bool.encode(true)).toBe(true);
            expect(primitives_1.bool.decode(false)).toBe(false);
        });
    });
});
