import {List} from 'immutable';
import {isBlank} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';
import {EncodingException} from './exceptions';
import {JsonObject} from './interfaces';
import {list} from './basic';

/**
 * Decodes an object of the form
 * {
 *  items: JsonObject[]
 * }
 *
 * into a List, using the given decoder
 */
export function itemList<T>(itemDecoder: Codec<T,JsonObject>): Codec<List<T>,JsonObject> {
    var listCodec = list<T>(itemDecoder);
    return {
        encode: (items: List<T>) => ({items: listCodec.encode(items)}),
        decode: (obj: JsonObject) => {
            if (isBlank(obj)) {
                throw new EncodingException('listCodec cannot decode `null` or `undefined`');
            }
            if (!Array.isArray(obj['items'])) {
                throw new EncodingException('object must have an \'items\' array');
            }
            return listCodec.decode(obj['items']);
        }
    }
}
