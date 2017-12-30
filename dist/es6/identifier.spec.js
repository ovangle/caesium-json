import { List } from 'immutable';
import { rewriteObjectIdentifiers, identifier } from './identifier';
import { stringReversingCodec } from "./test-utils";
class ReverseCase {
    decode(input) {
        let inputWords = List(input.split('-'));
        return {
            privacy: 0,
            words: inputWords.map(stringReversingCodec.decode)
        };
    }
    encode(identifier) {
        let reversedWords = identifier.words.map(stringReversingCodec.encode);
        return reversedWords.join('-');
    }
}
const reverseCase = new ReverseCase();
class UnderscoreCase {
    decode(input) {
        return { privacy: 0, words: List(input.split('_')) };
    }
    encode(input) {
        return input.words.join('_');
    }
}
const underscoreCase = new UnderscoreCase();
describe('identifier', () => {
    it('should encode/decode a string', () => {
        const identifierCodec = identifier(reverseCase, underscoreCase);
        expect(identifierCodec.encode('twas-the-best-of-times'))
            .toEqual('sawt_eht_tseb_fo_semit');
    });
});
describe('rewriteObjectIdentifiers()', () => {
    it('should encode/decode the keys of the object', () => {
        const objCodec = rewriteObjectIdentifiers(reverseCase, underscoreCase);
        expect(objCodec.encode({
            'hello-world': '1 2 3 4 5',
            'whats-happening': 'goodbye-world'
        })).toEqual({
            'olleh_dlrow': '1 2 3 4 5',
            'stahw_gnineppah': 'goodbye-world'
        });
        expect(objCodec.decode({
            'sit_eht': 'winter-of-my-discontent',
            'edam_suoirolg_remmus': 'by-the-son-of-york'
        })).toEqual({
            'tis-the': 'winter-of-my-discontent',
            'made-glorious-summer': 'by-the-son-of-york'
        });
    });
});
