export function nullable(codec) {
    return {
        encode: (input, context) => input != null ? codec.encode(input, context) : null,
        decode: (input, context) => input != null ? codec.decode(input, context) : null
    };
}
