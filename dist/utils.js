import { isBlank } from 'caesium-core/lang';
import { EncodingException } from 'caesium-core/codec';
// tODO: Move these definitions to caesium-core.
export function assertNotNull(value) {
    if (isBlank(value))
        throw new EncodingException('Value cannot be null');
}
export const error = {
    encode: (_) => {
        throw new EncodingException('A codec was not provided');
    },
    decode: (_) => {
        throw new EncodingException('A codec was not provided');
    }
};
export const nullSafeIdentity = {
    encode: (input) => {
        assertNotNull(input);
        return input;
    },
    decode: (input) => {
        assertNotNull(input);
        return input;
    }
};
