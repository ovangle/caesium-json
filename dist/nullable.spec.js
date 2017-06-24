"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const primitives_1 = require("./primitives");
const utils_spec_1 = require("./utils.spec");
const nullable_1 = require("./nullable");
describe('nullable', () => {
    it('should take a codec which ignores null and return a codec which accepts null', () => {
        expect(nullable_1.nullable(primitives_1.str).encode(null)).toBe(null);
        expect(nullable_1.nullable(primitives_1.str).decode(null)).toBe(null);
    });
    it('should apply the argument codec to non-null inputs', () => {
        expect(nullable_1.nullable(utils_spec_1.stringReversingCodec).encode('hello world')).toBe('dlrow olleh');
        expect(nullable_1.nullable(utils_spec_1.stringReversingCodec).decode('dlrow olleh')).toBe('hello world');
    });
});
