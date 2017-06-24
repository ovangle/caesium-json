"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const camel_case_to_snake_case_1 = require("./camel_case_to_snake_case");
describe('string_case_converters', () => {
    const codec = camel_case_to_snake_case_1.camelCaseToSnakeCase;
    it('should convert a snake case string to a camel case string', () => {
        expect(codec.decode('hello_world')).toBe('helloWorld');
        expect(codec.decode('camel_case_string')).toBe('camelCaseString');
    });
    it('should preserve leading underscores', () => {
        expect(codec.decode('__hello_world')).toBe('__helloWorld');
    });
    it('should throw if the input is not a camel case string', () => {
        // Must contain at least one letter
        expect(() => codec.decode('')).toThrow();
        expect(() => codec.decode('__')).toThrow();
        // Can only contain lower case letters and underscores
        expect(() => codec.decode('Jamie')).toThrow();
        expect(() => codec.decode('plan9')).toThrow();
        // Every underscore character must be between two letters
        expect(() => codec.decode('a__b')).toThrow();
    });
    it('should convert a camel case string to a snake case string', () => {
        expect(codec.encode('helloWorld')).toEqual('hello_world');
        expect(codec.encode('camelCaseString')).toEqual('camel_case_string');
    });
    it('should preserve leading underscores', () => {
        expect(codec.encode('__helloWorld')).toEqual('__hello_world');
    });
    it('should throw if input is not a camel case string', () => {
        // Must contain at least one letter
        expect(() => codec.encode('')).toThrow();
        expect(() => codec.encode('__')).toThrow();
        // The first character must be a lower case character
        expect(() => codec.encode('A')).toThrow();
        expect(() => codec.encode('__J')).toThrow();
        // must contain no non-alphabetic characters
        expect(() => codec.encode('a9')).toThrow();
        // Every capital letter must be followed by a lower case letter
        expect(() => codec.encode('anA')).toThrow();
    });
});
