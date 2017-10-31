
import {List, Map} from 'immutable';
import {Codec} from '../codec';
import {str, bool, num, date} from './primitives';

export function expectThrowsOnNullOrUndefined(codec: Codec<any,any>) {
    expect(() => codec.encode(null)).toThrow(jasmine.any(Error));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(Error));
    expect(()=> codec.decode(null)).toThrow(jasmine.any(Error));
    expect(() => codec.encode(undefined)).toThrow(jasmine.any(Error));
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
        })
    });

    describe('bool', () => {
        it('should throw on null or undefined ', () => {
            expectThrowsOnNullOrUndefined(bool);
        });

        it('should return argument unchanged', () => {
            expect(bool.encode(true)).toBe(true);
            expect(bool.decode(false)).toBe(false);
        })
    });

  describe('date', () => {
    it('should be able to encode and decode blank values', () => {
      expectThrowsOnNullOrUndefined(date);
    });

    it('should be able to encode/decode a date', () => {
      expect(date.encode(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
      expect(date.decode('1970-01-01T00:00:00Z')).toEqual(new Date(0));
    });
  });
});
