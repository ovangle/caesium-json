import {Codec} from './codec';

export function assertNotNull(value: any) {
    if (value == null)
        throw new Error('Value cannot be null');
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
