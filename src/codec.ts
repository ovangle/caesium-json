import {List, Map} from "immutable";

export interface Codec<T,U> {
  encode(input: T): U;
  decode(input: U): T;
}

export function isCodec(obj: any): obj is Codec<any,any> {
  return obj != null
      && typeof obj.encode === 'function'
      && typeof obj.decode === 'function';
}

export function invert<T1,T2>(codec: Codec<T1,T2>): Codec<T2,T1> {
  return {
    encode: (input) => codec.decode(input),
    decode: (input) => codec.encode(input)
  };
}

export function compose<T1,T2,T3>(codec_a: Codec<T1,T2>, codec_b: Codec<T2,T3>): Codec<T1,T3> {
  return {
    encode: (input) => codec_b.encode(codec_a.encode(input)),
    decode: (input) => codec_a.decode(codec_b.decode(input))
  }
}

export function identity<T>(): Codec<T,T> {
  return {encode: (input) => input, decode: (input) => input}
};

export function nullable<T,U>(codec: Codec<T,U>): Codec<T | null, U | null> {
  return {
    encode: (input) => input != null ? codec.encode(input) : null,
    decode: (input) => input != null ? codec.decode(input) : null
  }
}

export function array<T,U>(codec: Codec<T,U>): Codec<Array<T>,Array<U>> {
  return {
    encode: (input: Array<T>) => input.map((item) => codec.encode(item)),
    decode: (input: Array<U>) => input.map((item) => codec.decode(item))
  }
}

const listToArray: Codec<List<any>,Array<any>> = {
  encode: (input) => input.toArray(),
  decode: (input) => List(input)
}

export function list<T,U>(codec: Codec<T,U>): Codec<List<T>, Array<U>> {
  return compose(listToArray, array(codec));
}


export function map<K, V1, V2>(codec: Codec<V1,V2>): Codec<Map<K,V1>,Map<K,V2>> {
  return {
    encode: (input) => input.map(codec.encode).toMap(),
    decode: (input) => input.map(codec.decode).toMap()
  }
}


/**
 * Codec which bottoms out with an exception on encode and decode.
 * @type {{encode: ((_) => any); decode: ((_) => any)}}
 */
export const error: Codec<any,any> = {
  encode: (_) => {
    throw new Error('A codec was not provided');
  },
  decode: (_) => {
    throw new Error('A codec was not provided');
  }
}


