import { List, Map, Record, Set } from 'immutable';
import { Codec } from "./codec";
export declare function array<T, U>(codec: Codec<T, U>): Codec<Array<T>, Array<U>>;
export declare function list<T, U>(codec: Codec<T, U>): Codec<List<T>, Array<U>>;
export declare function set<T, U>(codec: Codec<T, U>): Codec<Set<T>, Array<U>>;
export declare function object<T>(codecs: {
    [K in keyof T]?: Codec<T[K], any>;
}): Codec<T, {
    [K in keyof T]: any;
}>;
export declare function map<K, V1, V2>(codec: Codec<V1, V2>): Codec<Map<K, V1>, Map<K, V2>>;
export declare function record<TProps, U extends Record<TProps>>(ctor: {
    new (params?: Partial<TProps>): U;
}, codecs: {
    [K in keyof TProps]: Codec<TProps[K], any>;
}): Codec<U, {
    [K in keyof TProps]: any;
}>;
