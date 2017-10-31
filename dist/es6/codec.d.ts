import { List, Map } from "immutable";
export interface Codec<T, U> {
    encode(input: T): U;
    decode(input: U): T;
}
export declare function isCodec(obj: any): obj is Codec<any, any>;
export declare function invert<T1, T2>(codec: Codec<T1, T2>): Codec<T2, T1>;
export declare function compose<T1, T2, T3>(codec_a: Codec<T1, T2>, codec_b: Codec<T2, T3>): Codec<T1, T3>;
export declare function identity<T>(): Codec<T, T>;
export declare function nullable<T, U>(codec: Codec<T, U>): Codec<T | null, U | null>;
export declare function array<T, U>(codec: Codec<T, U>): Codec<Array<T>, Array<U>>;
export declare function list<T, U>(codec: Codec<T, U>): Codec<List<T>, Array<U>>;
export declare function map<K, V1, V2>(codec: Codec<V1, V2>): Codec<Map<K, V1>, Map<K, V2>>;
/**
 * Codec which bottoms out with an exception on encode and decode.
 * @type {{encode: ((_) => any); decode: ((_) => any)}}
 */
export declare const error: Codec<any, any>;
