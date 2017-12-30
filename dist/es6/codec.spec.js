import { compose, contextValue, error, identity, invert, isCodec } from "./codec";
describe('codec', () => {
    describe('isCodec', () => {
        it('should test whether an object matches the codec interface', () => {
            expect(isCodec(null)).toBeFalsy();
            expect(isCodec('')).toBeFalsy();
            expect(isCodec({ encode: () => { return 0; }, decode: () => { return 0; } })).toBeTruthy();
        });
    });
    describe('invert', () => {
        it('should reverse the roles of encode and decode', () => {
            let codec = {
                encode: (num) => num * 2,
                decode: (num) => num / 2
            };
            expect(codec.encode(8)).toBe(16);
            expect(codec.decode(8)).toBe(4);
            let inverted = invert(codec);
            expect(inverted.encode(8)).toBe(4);
            expect(inverted.decode(8)).toBe(16);
        });
    });
    describe('compose', () => {
        it('should apply multiple codecs in succession', () => {
            function multiplyBy(multiple) {
                return {
                    encode: (val) => val * multiple,
                    decode: (val) => val / multiple
                };
            }
            let multiplyByTen = compose(multiplyBy(5), multiplyBy(2));
            expect(multiplyByTen.encode(10)).toBe(100);
            expect(multiplyByTen.decode(10)).toBe(1);
        });
    });
    describe('identity', () => {
        it('should do nothing when encoding/decoding an input', () => {
            const codec = identity();
            expect(codec.encode(null)).toBe(null);
            expect(codec.encode(50)).toBe(50);
            expect(codec.encode({ hello: 'world' })).toEqual({ hello: 'world' });
        });
    });
    describe('contextValue', () => {
        it('should add the specified value to the context on encode', () => {
            let context = {};
            let codec = contextValue('fromContext');
            expect(codec.encode({ fromContext: 42 }, context))
                .toBeUndefined();
            console.log('context', context);
            expect(context['fromContext']).toBe(42);
        });
        it('should read the value from the context on decode', () => {
            let codec = contextValue('fromContext');
            expect(codec.decode(undefined, { fromContext: 'hello world' }))
                .toEqual('hello world');
        });
        it('should generate a value if the context value is callable', () => {
            let codec = contextValue('count');
            let value = 0;
            let counter = {
                count: () => { return value += 1; }
            };
            expect(codec.decode(undefined, counter)).toEqual(1);
            expect(codec.decode(undefined, counter)).toEqual(2);
            expect(codec.decode(undefined, counter)).toEqual(3);
        });
        it('should throw if there is no value in the context', () => {
            let context = {};
            let codec = contextValue('missing');
            expect(() => codec.decode(undefined, context))
                .toThrow('No value provided for identifier \'missing\' in context.');
        });
    });
    describe('error', () => {
        it('should throw on encode and decode', () => {
            expect(() => error.decode('hello world')).toThrow();
            expect(() => error.encode('hello world')).toThrow();
        });
    });
});
