import { List, Map, Record, Set } from 'immutable';
import { Codec, compose, identity, isCodec, invert, error, contextValue } from "./codec";
import { nullable } from './nullable';
export { Codec, compose, identity, isCodec, invert, error, nullable, contextValue };
export { Json, JsonPrimitive, JsonArray, JsonObject } from './json';
export declare const json: {
    bool: Codec<boolean, boolean>;
    num: Codec<number, number>;
    str: Codec<string, string>;
    date: Codec<Date, string>;
    array: <T, U>(codec: Codec<T, U>) => Codec<T[], U[]>;
    list: <T, U>(codec: Codec<T, U>) => Codec<List<T>, U[]>;
    object: <T, TObject extends {
        [K in keyof T]: string | number | boolean | any[] | {
            [k: string]: any;
        } | null;
    } = {
        [K in keyof T]: string | number | boolean | any[] | {
            [k: string]: any;
        } | null;
    }>(codecs: {
        [K in (keyof T) & (keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
    }) => Codec<T, TObject> & {
        [K in (keyof T) & (keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
    };
    partialObject: <T, TObject extends {
        [K in keyof T]: string | number | boolean | any[] | {
            [k: string]: any;
        } | null;
    } = {
        [K in keyof T]: string | number | boolean | any[] | {
            [k: string]: any;
        } | null;
    }>(codecs: {
        [K in (keyof T) & (keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
    }) => Codec<Partial<T>, TObject> & {
        [K in (keyof T) & (keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
    };
    map: <K, V1, V2>(codec: Codec<V1, V2>) => Codec<Map<K, V1>, Map<K, V2>>;
    record: <T, TRecord extends Record<T>, TObject extends {
        [K in keyof T]: string | number | boolean | any[] | {
            [k: string]: any;
        } | null;
    }>(ctor: new (params?: Partial<T> | undefined) => TRecord, codecs: {
        [K in (keyof T) & (keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
    }) => Codec<TRecord, TObject> & {
        [K in (keyof T) & (keyof TObject)]: Codec<T[K], TObject[K] | undefined>;
    };
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
