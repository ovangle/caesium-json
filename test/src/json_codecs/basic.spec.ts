import {List, Map} from 'immutable';
import {identity} from 'caesium-core/codec';
import {str, bool, num, date, list, map} from '../../../src/json_codecs/basic';

export function basicTests() {
    describe('basic', () => {
        describe('str', () => {
            it('should be just an identity codec', () => {
                expect(str).toBe(identity);
            });
        });
        describe('num', () => {
            it('should just be an identity codec', () => {
                expect(num).toBe(identity);
            });
        });
        describe('bool', () => {
            it('should be an identity codec', () => {
                expect(bool).toBe(identity);
            });
        });
        describe('date', () => {
            it('should be able to encode and decode blank values', () => {
                expect(date.encode(null)).toBeNull('encode null');
                expect(date.decode(null)).toBeNull('decode null');
                expect(date.encode(undefined)).toBeUndefined('encode undefined');
                expect(date.decode(undefined)).toBeUndefined('decode undefined');
            });

            it('should be able to encode a date as an ISO string', () => {
                expect(date.encode(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
            });

            it('should be able to decode an ISO string into a date', () => {
                expect(date.decode('1970-01-01T00:00:00Z')).toEqual(new Date(0));
            });
        });

        describe('map', () => {
            it('should not be able to encode or decode blank values', () => {
                var l = map(identity);
                expect(() => l.encode(null)).toThrow();
                expect(() => l.decode(null)).toThrow();

                expect(() => l.encode(undefined)).toThrow();
                expect(() => l.decode(undefined)).toThrow();
            });

            it('should be able to encode a Map into a json object', () => {
                var l = map({
                    encode: (i: number) => i + 1,
                    decode: (i) => i - 1
                });
                expect(l.encode(Map({a: 1, b: 2, c: 3})))
                    .toEqual({a: 2, b: 3, c: 4});
            });

            it('should be able to decode a json object into a Map', ()=> {
                var l = map({
                    encode: (i: number) => i + 1,
                    decode: (i) => i - 1
                });

                expect(l.decode({a: 1, b: 2, c: 3}))
                    .toEqual(Map({a: 0, b: 1, c: 2}));
            });
        });

        describe('list', () => {
            it('should not be able to encode blank values', () => {
                var l = list(identity);
                expect(() => l.encode(null)).toThrow();
                expect(() => l.decode(null)).toThrow();

                expect(() => l.encode(undefined)).toThrow();
                expect(() => l.decode(undefined)).toThrow();
            });

            it('should be able to encode a list of values into a javascript array', () => {
                var l = list({
                    encode: (i: number) => i + 1,
                    decode: (i) => i - 1
                });
                expect(l.encode(List([1, 2, 3, 4, 5])))
                    .toEqual([2, 3, 4, 5, 6])
            });

            it('should be able to decode a javascript array into a List', ()=> {
                var l = list({
                    encode: (i: number) => i + 1,
                    decode: (i) => i - 1
                });

                expect(l.decode([1, 2, 3, 4, 5]))
                    .toEqual(List([0, 1, 2, 3, 4]));
            });

        });

    });
}
