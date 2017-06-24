import { EncodingException } from 'caesium-core/codec';
import { str, bool, num } from './primitives';
export function expectThrowsOnNullOrUndefined(codec) {
    expect(() => codec.encode(null)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.decode(null)).toThrow(jasmine.any(EncodingException));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(EncodingException));
}
describe('primitives', () => {
    describe('str', () => {
        it('should throw on null or undefined', () => {
            expectThrowsOnNullOrUndefined(str);
        });
        it('should return argument unchanged', () => {
            expect(str.encode('hello')).toBe('hello');
            expect(str.decode('world')).toBe('world');
        });
    });
    describe('num', () => {
        it('should throw on null or undefined ', () => {
            expectThrowsOnNullOrUndefined(num);
        });
        it('should return argument unchanged', () => {
            expect(num.encode(42)).toBe(42);
            expect(num.decode(128)).toBe(128);
        });
    });
    describe('bool', () => {
        it('should throw on null or undefined ', () => {
            expectThrowsOnNullOrUndefined(bool);
        });
        it('should return argument unchanged', () => {
            expect(bool.encode(true)).toBe(true);
            expect(bool.decode(false)).toBe(false);
        });
    });
});
