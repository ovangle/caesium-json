import {List} from 'immutable';
import {identity} from 'caesium-core/codec';
import {itemList} from '../../src/json_codecs/item_list';


const A_TO_B_CODEC = {
    encode: (input: {a: any}) => ({b: input.a}),
    decode: (input: {b: any}) => ({a: input.b})
};

describe('json_codecs.item_list', () => {

    it('should be possible to decode an itemList of json objects', () => {
        var codec = itemList(identity);

        expect(codec.decode({
            items: [{a: 1}, {a: 2}]
        }).toArray()).toEqual([{a: 1}, {a: 2}]);
    });

    it('should throw when the item list is invalid', () => {
        var codec = itemList(identity);
        expect(() => codec.decode(null)).toThrow();
        expect(() => codec.decode({})).toThrow();
    });

    it('should use the provided item codec when decoding', () => {
        var codec = itemList(A_TO_B_CODEC);
        expect(codec.decode({
            items: [{b: 1}, {b: 2}]
        }).toArray()).toEqual([{a: 1}, {a: 2}]);
    });

    it('should be possible to encode an itemList of json objects', () => {
        var codec = itemList(identity);
        expect(codec.encode(List.of({a: 1}, {a: 2})))
            .toEqual({
                items: [{a: 1}, {a: 2}]
            });
    });

    it('should use the appropriate item decoder when encoding', () => {
        var codec = itemList(A_TO_B_CODEC);
        expect(codec.encode(List.of({a: 1}, {a: 2})))
            .toEqual({
                items: [{b: 1}, {b: 2}]
            })
    });

});
