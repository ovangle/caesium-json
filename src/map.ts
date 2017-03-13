import {Map} from 'immutable';

import {isBlank} from 'caesium-core/lang';
import {Codec, EncodingException} from 'caesium-core/codec';

import {str} from './primitives';
import {Json} from './interfaces';

export function map<K,V>(valueCodec: Codec<V,Json>, keyCodec?: Codec<K,string>): Codec<Map<K,V>,Json> {
    const _keyCodec: Codec<any,string> = keyCodec || str;

    return {
        encode: (map: Map<K,V>) => {
            if (isBlank(map))
                throw new EncodingException('Expected map, got blank value');
            return map
                .mapEntries(([key, value]) => [_keyCodec.encode(key), valueCodec.encode(value)])
                .toObject()
        },
        decode: (json: Json) => {
            if (isBlank(json))
                throw new EncodingException('Expected object, got blank value');
            const map = Map<string,Json>(json)
                .mapEntries(([key, value]) => [_keyCodec.decode(key), valueCodec.decode(value)])
            return map as Map<K,V>;
        }
    }
}

