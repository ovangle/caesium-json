import {List} from 'immutable';
import {identityConverter} from 'caesium-core/converter';
import {jsonToObject, objectToJson} from "../../src/json_codecs/object_to_json";


function incrementingEncoder(input: number): number {
    return input + 1;
}

function _converterForPropName(propName: string) {
    switch (propName) {
        case 'a':
            return identityConverter;
        case 'b':
            return incrementingEncoder;
        default:
            return undefined;
    }
}

describe('json_codecs.object_to_json', () => {
    describe('objectToJson', () => {
        it('should be able to encode a json record', () => {
            var encoder = objectToJson(
                List<string>(['a', 'helloWorld']),
                (propName) => identityConverter
            );
            expect(encoder({a: 1, helloWorld: 'hello world'}))
                .toEqual({a: 1, hello_world: 'hello world'});
        });

        it('should use the correct encoder for the given attribute', () => {
            var encoder = objectToJson(
                List(['a', 'b']),
                _converterForPropName
            );
            expect(encoder({a: 1, b: 2})).toEqual({a: 1, b: 3});
        });

        it('should throw if there is no encoder for an attribute', () => {
            var encoder = objectToJson(
                List(['a', 'b', 'c']),
                _converterForPropName
            );
            expect(() => encoder({c: 1})).toThrow();
        });

        it('should always return an object with an Object prototype', () => {
            var encoder = objectToJson(
                List<string>(),
                (_) => identityConverter
            );
            expect(Object.getPrototypeOf(encoder({})))
                .toEqual(Object.prototype);
        });

        it('should not encode undefined values', () => {
            var encoder = objectToJson(
                List<string>(['a']),
                (_) => identityConverter
            );
            expect(encoder({a: undefined})).toEqual({});
        });

        it('should handle blank values', () => {
            var encoder = objectToJson(
                List<string>([]),
                (_) => identityConverter
            );
            expect(encoder(null)).toBeNull();
            expect(encoder(undefined)).toBeUndefined();
        });

    });

    describe('jsonToObject', () => {
        it('should be able to encode an object', () => {
            var encoder = jsonToObject(
                List<string>(['a', 'helloWorld']),
                propName => identityConverter,
                values => values
            );
            expect(encoder({a: 1, hello_world: 'hello world'}))
                .toEqual({a: 1, helloWorld: 'hello world'});
        });

        it('should use the correct converter for the given attribute', () => {
            var encoder = jsonToObject(
                List<string>(['a', 'b']),
                _converterForPropName,
                values => values
            );
            expect(encoder({a: 1, b: 2})).toEqual({a: 1, b: 3});
        });
        it('should throw if there is no encoder for the given property', () => {
            var encoder = jsonToObject(
                List<string>(['a', 'b', 'c']),
                _converterForPropName,
                values => values
            );
            /// no converter returned
            expect(() => encoder({c: 1})).toThrow();
        });

        it('should use the provided factory when constructing the result', () => {
            class Yolo {
                constructor(public values: {[attr: string]: any}) { }
                foo():any { return null; }
            }
            var encoder = jsonToObject(
                List<string>(['a']),
                attr => identityConverter,
                values => new Yolo(values)
            );
            var result = encoder({a: 1}) as Yolo;
            expect(result).toEqual(jasmine.any(Yolo));
            expect(result.values).toEqual({a: 1});
        });

        it('should handle blank values', () => {
            var encoder = jsonToObject(
                List<string>([]),
                identityConverter,
                values => values
            );

            expect(encoder(null)).toBeNull();
            expect(encoder(undefined)).toBeUndefined();
        });
    });
});
