import { Map } from 'immutable';
import { map } from './map';
import { num } from './primitives';
import { expectThrowsOnNullOrUndefined, numberIncrementingCodec, stringReversingCodec } from './utils.spec';
describe('map', () => {
    it('throw on null or undefined, even if item codec is nullable', () => {
        expectThrowsOnNullOrUndefined(map(num));
    });
    it('should apply the value codec to each value in the map', () => {
        const codec = map(numberIncrementingCodec);
        expect(codec.encode(Map({ a: 1, b: 2, c: 3 }))).toEqual({ a: 2, b: 3, c: 4 });
        expect(codec.decode({ a: 1, b: 2, c: 3 })).toEqual(Map({ a: 0, b: 1, c: 2 }));
    });
    it('sould apply the key codec to each key in the map', () => {
        const codec = map(num, stringReversingCodec);
        expect(codec.encode(Map({ hello: 42, world: 24 })))
            .toEqual({ olleh: 42, dlrow: 24 });
        expect(codec.decode({ dlrow: 24, olleh: 42 }))
            .toEqual(Map({ world: 24, hello: 42 }));
    });
});
