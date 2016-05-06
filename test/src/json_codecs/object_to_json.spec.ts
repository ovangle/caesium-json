import {identityConverter} from 'caesium-core/converter';
import {jsonToObject, objectToJson} from "../../../src/json_codecs/object_to_json";


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

export function objectToJsonTests() {
    describe('object_to_json', () => {
        _objectToJsonEncoderTests();
        jsonToObjectTests();
    });
}

function _objectToJsonEncoderTests() {
    describe('objectToJson', () => {
        it('should be able to encode a json record', () => {
            var encoder = objectToJson((propName) => identityConverter);
            expect(encoder({a: 1, helloWorld: 'hello world'}))
                .toEqual({a: 1, hello_world: 'hello world'});
        });

        it('should use the correct encoder for the given attribute', () => {
            var encoder = objectToJson(_converterForPropName);
            expect(encoder({a: 1, b: 2})).toEqual({a: 1, b: 3});
            expect(() => encoder({c: 1})).toThrow();
        });

        it('should always return an object with an Object prototype', () => {
            var encoder = objectToJson((_) => identityConverter);
            expect(Object.getPrototypeOf(encoder({})))
                .toEqual(Object.prototype);
        });

        it('should not encode undefined values', () => {
            var encoder = objectToJson((_) => identityConverter);
            expect(encoder({a: undefined})).toEqual({});
        });

        it('should handle blank values', () => {
            var encoder = objectToJson((_) => identityConverter);
            expect(encoder(null)).toBeNull();
            expect(encoder(undefined)).toBeUndefined();
        });

    });
}

function jsonToObjectTests() {
    describe('ObjectToJson', () => {
        it('should be able to encode an object', () => {
            var encoder = jsonToObject(propName => identityConverter, values => values);
            expect(encoder({a: 1, hello_world: 'hello world'}))
                .toEqual({a: 1, helloWorld: 'hello world'});
        });

        it('should use the correct converter for the given attribute', () => {
            var encoder = jsonToObject(_converterForPropName, values => values);
            expect(encoder({a: 1, b: 2})).toEqual({a: 1, b: 3});
            /// no converter returned
            expect(() => encoder({c: 1})).toThrow();
        });

        it('should use the provided factory when constructing the result', () => {
            class Yolo {
                constructor(public values: {[attr: string]: any}) { }
                foo():any { return null; }
            }
            var encoder = jsonToObject(attr => identityConverter, values => new Yolo(values));
            var result = encoder({a: 1}) as Yolo;
            expect(result).toEqual(jasmine.any(Yolo));
            expect(result.values).toEqual({a: 1});
        });

        it('should handle blank values', () => {
            var encoder = jsonToObject(identityConverter, values => values);

            expect(encoder(null)).toBeNull();
            expect(encoder(undefined)).toBeUndefined();
        });
    });
}
