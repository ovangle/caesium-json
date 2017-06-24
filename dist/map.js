import { Map } from 'immutable';
import { isBlank } from 'caesium-core/lang';
import { EncodingException } from 'caesium-core/codec';
import { str } from './primitives';
export function map(valueCodec, keyCodec) {
    const _keyCodec = keyCodec || str;
    return {
        encode: (map) => {
            if (isBlank(map))
                throw new EncodingException('Expected map, got blank value');
            return map
                .mapEntries(([key, value]) => [_keyCodec.encode(key), valueCodec.encode(value)])
                .toObject();
        },
        decode: (json) => {
            if (isBlank(json))
                throw new EncodingException('Expected object, got blank value');
            const map = Map(json)
                .mapEntries(([key, value]) => [_keyCodec.decode(key), valueCodec.decode(value)]);
            return map;
        }
    };
}
