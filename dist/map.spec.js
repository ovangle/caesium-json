"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const map_1 = require("./map");
const primitives_1 = require("./primitives");
const utils_spec_1 = require("./utils.spec");
describe('map', () => {
    it('throw on null or undefined, even if item codec is nullable', () => {
        utils_spec_1.expectThrowsOnNullOrUndefined(map_1.map(primitives_1.num));
    });
    it('should apply the value codec to each value in the map', () => {
        const codec = map_1.map(utils_spec_1.numberIncrementingCodec);
        expect(codec.encode(immutable_1.Map({ a: 1, b: 2, c: 3 }))).toEqual({ a: 2, b: 3, c: 4 });
        expect(codec.decode({ a: 1, b: 2, c: 3 })).toEqual(immutable_1.Map({ a: 0, b: 1, c: 2 }));
    });
    it('sould apply the key codec to each key in the map', () => {
        const codec = map_1.map(primitives_1.num, utils_spec_1.stringReversingCodec);
        expect(codec.encode(immutable_1.Map({ hello: 42, world: 24 })))
            .toEqual({ olleh: 42, dlrow: 24 });
        expect(codec.decode({ dlrow: 24, olleh: 42 }))
            .toEqual(immutable_1.Map({ world: 24, hello: 42 }));
    });
});
