import { List } from 'immutable';
import { isBlank } from 'caesium-core/lang';
import { EncodingException } from 'caesium-core/codec';
export function list(itemCodec) {
    return {
        encode: (list) => {
            if (isBlank(list))
                throw new EncodingException('Expected list, got blank value');
            return list
                .map((item) => itemCodec.encode(item))
                .toArray();
        },
        decode: (jsonList) => {
            if (isBlank(jsonList))
                throw new EncodingException('Expected array, got blank value');
            return List(jsonList)
                .map((item) => itemCodec.decode(item))
                .toList();
        }
    };
}
