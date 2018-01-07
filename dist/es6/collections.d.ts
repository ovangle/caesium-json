import { List, Map, Record, Set } from 'immutable';
import { Codec } from "./codec";
import { JsonObject } from "./json";
export declare function array<T, U>(codec: Codec<T, U>): Codec<Array<T>, Array<U>>;
export declare function list<T, U>(codec: Codec<T, U>): Codec<List<T>, Array<U>>;
export declare function set<T, U>(codec: Codec<T, U>): Codec<Set<T>, Array<U>>;
export declare type CodecMap<T, TObject extends JsonObject<T>> = {
    [K in (keyof T & keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
};
/**
 * Encodes an arbitrary object as a
 *
 *
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export declare function partialObject<T, TObject extends JsonObject<T> = JsonObject<T>>(codecs: CodecMap<T, TObject>): (Codec<Partial<T>, TObject> & CodecMap<T, TObject>);
export declare function object<T, TObject extends JsonObject<T> = JsonObject<T>>(codecs: CodecMap<T, TObject>): Codec<T, TObject> & CodecMap<T, TObject>;
export declare function map<K, V1, V2>(codec: Codec<V1, V2>): Codec<Map<K, V1>, Map<K, V2>>;
export declare function record<T, TRecord extends Record<T>, TObject extends JsonObject<T>>(ctor: {
    new (params?: Partial<T>): TRecord;
}, codecs: CodecMap<T, TObject>): Codec<TRecord, TObject> & CodecMap<T, TObject>;
