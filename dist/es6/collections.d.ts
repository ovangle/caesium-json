import { List, Map, Set } from 'immutable';
import { Codec } from "./codec";
export declare function array<T, U>(codec: Codec<T, U>): Codec<Array<T>, Array<U>>;
export declare function list<T, U>(codec: Codec<T, U>): Codec<List<T>, Array<U>>;
export declare function set<T, U>(codec: Codec<T, U>): Codec<Set<T>, Array<U>>;
export declare function dict<K, V1, V2>(codec: Codec<V1, V2>): Codec<Map<K, V1>, Map<K, V2>>;
