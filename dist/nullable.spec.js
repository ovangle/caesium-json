import { str } from './primitives';
import { stringReversingCodec } from './utils.spec';
import { nullable } from './nullable';
describe('nullable', () => {
    it('should take a codec which ignores null and return a codec which accepts null', () => {
        expect(nullable(str).encode(null)).toBe(null);
        expect(nullable(str).decode(null)).toBe(null);
    });
    it('should apply the argument codec to non-null inputs', () => {
        expect(nullable(stringReversingCodec).encode('hello world')).toBe('dlrow olleh');
        expect(nullable(stringReversingCodec).decode('dlrow olleh')).toBe('hello world');
    });
});
