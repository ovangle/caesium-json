import {isBlank} from 'caesium-core/lang';
import {Codec, EncodingException} from 'caesium-core/codec';

// tODO: Move these definitions to caesium-core.


export function assertNotNull(value: any) {
    if (isBlank(value))
        throw new EncodingException('Value cannot be null');
}

export const error: Codec<any,any> = {
    encode: (_) => {
        throw new EncodingException('A codec was not provided');
    },
    decode: (_) => {
        throw new EncodingException('A codec was not provided');
    }
}


export const nullSafeIdentity: Codec<any,any> = {
    encode: (input: any) => {
        assertNotNull(input);
        return input;
    },
    decode: (input: any) => {
        assertNotNull(input);
        return input;
    }
}
