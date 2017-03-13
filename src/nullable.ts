import {Codec} from 'caesium-core/codec';

/**
 * Turns a codec which does not accept blank values into a codec which does.
 */
export function nullable<T,U>(codec: Codec<T,U>): Codec<T | null, U | null> {
    return {
        encode: (input: any) => input === null ? null : codec.encode(input),
        decode: (input: any) => input === null ? null : codec.decode(input)
    }
}
