import { Record } from 'immutable';
import { JsonObject } from "./json";
import { Codec } from "./codec";
export declare type CodecMap<T, TObject = JsonObject<keyof T>> = {
    [K in (keyof T & keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
};
export declare function isCodecMap<T>(obj: any): obj is CodecMap<T>;
/**
 *
 * @param {{[K in keyof T]?: Codec<T[K], any>}} codecs
 * @returns {Codec<T, {[K in keyof T]: any}>}
 */
export declare function partialObject<T>(codecsOrMap: CodecMap<T> | {
    codecs: CodecMap<T>;
}, maybeFactory?: (args: Partial<T>) => Partial<T>): Codec<Partial<T>, JsonObject<keyof T>> & {
    codecs: CodecMap<T>;
};
export declare function object<T>(mapOrCodecs: CodecMap<T> | {
    codecs: CodecMap<T>;
}, maybeFactory?: (args: T) => T): Codec<T, JsonObject<keyof T>> & {
    codecs: CodecMap<T>;
};
export declare function record<T, TRecord extends Record<T>>(ctor: {
    new (params?: Partial<T>): TRecord;
}, map: CodecMap<T> | {
    codecs: CodecMap<T>;
}): Codec<TRecord, JsonObject<keyof T>> & {
    codecs: CodecMap<T>;
};
