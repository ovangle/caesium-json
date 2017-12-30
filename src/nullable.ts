import {Codec} from "./codec";

export function nullable<T,U>(codec: Codec<T,U>): Codec<T | null, U | null> {
  return {
    encode: (input, context) => input != null ? codec.encode(input, context) : null,
    decode: (input, context) => input != null ? codec.decode(input, context) : null
  }
}
