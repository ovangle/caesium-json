"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const list_1 = require("./list");
const primitives_1 = require("./primitives");
const utils_spec_1 = require("./utils.spec");
describe('list', () => {
    it('throw on null or undefined, even if item codec is nullable', () => {
        utils_spec_1.expectThrowsOnNullOrUndefined(list_1.list(primitives_1.num));
    });
    it('should apply the item codec to each item in the list', () => {
        var l = list_1.list(utils_spec_1.numberIncrementingCodec);
        expect(l.encode(immutable_1.List([1, 2, 3, 4, 5]))).toEqual([2, 3, 4, 5, 6]);
        expect(l.decode([1, 2, 3, 4, 5])).toEqual(immutable_1.List([0, 1, 2, 3, 4]));
    });
});
