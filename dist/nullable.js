/**
 * Turns a codec which does not accept blank values into a codec which does.
 */
export function nullable(codec) {
    return {
        encode: (input) => input === null ? null : codec.encode(input),
        decode: (input) => input === null ? null : codec.decode(input)
    };
}
