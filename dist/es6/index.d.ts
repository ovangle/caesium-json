import { List, Map, Record, Set } from 'immutable';
import { Codec, compose, identity, isCodec, invert, error } from "./codec";
import { nullable } from './nullable';
export { Codec, compose, identity, isCodec, invert, error, nullable };
export { Json, JsonPrimitive, JsonArray, JsonObject } from './json';
export declare const json: {
    bool: Codec<boolean, boolean>;
    num: Codec<number, number>;
    str: Codec<string, string>;
    date: Codec<Date, string>;
    array: <T, U>(codec: Codec<T, U>) => Codec<T[], U[]>;
    list: <T, U>(codec: Codec<T, U>) => Codec<List<T>, U[]>;
    object: <T>(codecs: {
        [K in keyof T]?: Codec<T[K], any> | undefined;
    }) => Codec<T, {
        [K in keyof T]: any;
    }>;
    map: <K, V1, V2>(codec: Codec<V1, V2>) => Codec<Map<K, V1>, Map<K, V2>>;
    record: <TProps, U extends Record<TProps>>(ctor: new (params?: Partial<TProps> | undefined) => U, codecs: {
        [K in keyof TProps]: Codec<TProps[K], any>;
    }) => Codec<U, {
        [K in keyof TProps]: any;
    }>;
    set: <T, U>(codec: Codec<T, U>) => Codec<Set<T>, U[]>;
    nullable: <T, U>(codec: Codec<T, U>) => Codec<T | null, U | null>;
};
export { PrivacyLevel, Word, Identifier, IdentifierFormat, identifier, rewriteObjectIdentifiers } from './identifier';
import { Identifier } from './identifier';
export declare const identifierFormats: {
    upperCamelCase: {
        decode(input: string): {
            privacy: number;
            words: List<string>;
        };
        encode(input: Identifier): string;
    };
    lowerCamelCase: {
        decode(input: string): {
            privacy: number;
            words: List<string>;
        };
        encode(input: Identifier): string;
    };
    underscoreCase: {
        decode(input: string): Identifier;
        encode(identifier: Identifier): string;
    };
};
