import {List} from 'immutable';

import {isBlank} from 'caesium-core/lang';
import {Codec, EncodingException} from 'caesium-core/codec';

import {Json} from './interfaces';

export function list<T>(itemCodec: Codec<T,Json>): Codec<List<T>,Json> {
    return {
        encode: (list: List<T>) => {
            if (isBlank(list))
                throw new EncodingException('Expected list, got blank value');
            return list
                .map((item) => itemCodec.encode(item))
                .toArray();
        },
        decode: (jsonList: any[]) => {
            if (isBlank(jsonList))
                throw new EncodingException('Expected array, got blank value');
            return List<T>(jsonList)
                .map((item) => itemCodec.decode(item))
                .toList();
        }
    };
}
