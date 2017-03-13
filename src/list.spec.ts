import {List} from 'immutable';
import {list} from './list';
import {num} from './primitives';
import {
    expectThrowsOnNullOrUndefined,
    numberIncrementingCodec
} from './utils.spec';

describe('list', () => {
    it('throw on null or undefined, even if item codec is nullable', () => {
        expectThrowsOnNullOrUndefined(list(num));
    });

    it('should apply the item codec to each item in the list', () => {
        var l = list(numberIncrementingCodec);

        expect(l.encode(List([1, 2, 3, 4, 5]))).toEqual([2, 3, 4, 5, 6])
        expect(l.decode([1, 2, 3, 4, 5])).toEqual(List([0, 1, 2, 3, 4]));
    });

});
