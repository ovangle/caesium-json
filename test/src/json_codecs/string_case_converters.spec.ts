import {snakeCaseToCamelCase, camelCaseToSnakeCase} from '../../../src/json_codecs/string_case_converters';

export function stringCaseConverterTests() {
    describe('string_case_converters', () => {
        snakeCaseToCamelCaseTests();
        camelCaseToSnakeCaseTests();
    });
}

function snakeCaseToCamelCaseTests() {
    describe('snakeCaseToCamelCase', () => {
        var encoder = snakeCaseToCamelCase;

        it('should convert a snake case string to a camel case string', () => {
            expect(encoder('hello_world')).toBe('helloWorld');
            expect(encoder('camel_case_string')).toBe('camelCaseString');
        });

        it('should preserve leading underscores', () => {
            expect(encoder('__hello_world')).toBe('__helloWorld');
        });

        it('should throw if the input is not a camel case string', () => {
            // Must contain at least one letter
            expect(() => encoder('')).toThrow();
            expect(() => encoder('__')).toThrow();
            // Can only contain lower case letters and underscores
            expect(() => encoder('Jamie')).toThrow();
            expect(() => encoder('plan9')).toThrow();
            // Every underscore character must be between two letters
            expect(() => encoder('a__b')).toThrow();
        });
    });
}

function camelCaseToSnakeCaseTests() {

    describe('camelCaseToSnakeCase', () => {
        var encoder = camelCaseToSnakeCase;

        it('should convert a camel case string to a snake case string', () => {
            expect(encoder('helloWorld')).toEqual('hello_world');
            expect(encoder('camelCaseString')).toEqual('camel_case_string');
        });

        it('should preserve leading underscores', () => {
            expect(encoder('__helloWorld')).toEqual('__hello_world');
        });

        it('should throw if input is not a camel case string', () => {
            // Must contain at least one letter
            expect(() => encoder('')).toThrow();
            expect(() => encoder('__')).toThrow();
            // The first character must be a lower case character
            expect(() => encoder('A')).toThrow();
            expect(() => encoder('__J')).toThrow();
            // must contain no non-alphabetic characters
            expect(() => encoder('a9')).toThrow();
            // Every capital letter must be followed by a lower case letter
            expect(() => encoder('anA')).toThrow();
        });
    });
}
