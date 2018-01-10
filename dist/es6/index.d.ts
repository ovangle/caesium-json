import { List, Map, Record, Set } from 'immutable';
import { Codec, compose, identity, isCodec, invert, error, contextValue } from "./codec";
import { nullable } from './nullable';
export { Codec, compose, identity, isCodec, invert, error, nullable, contextValue };
export { Json, JsonPrimitive, JsonArray, JsonObject } from './json';
export { CodecMap, isCodecMap } from './mappings';
export declare const json: {
    bool: Codec<boolean, boolean>;
    num: Codec<number, number>;
    str: Codec<string, string>;
    date: Codec<Date, string>;
    array: <T, U>(codec: Codec<T, U>) => Codec<T[], U[]>;
    list: <T, U>(codec: Codec<T, U>) => Codec<List<T>, U[]>;
    dict: <K, V1, V2>(codec: Codec<V1, V2>) => Codec<Map<K, V1>, Map<K, V2>>;
    set: <T, U>(codec: Codec<T, U>) => Codec<Set<T>, U[]>;
    object: <T>(mapOrCodecs: {
        [K in keyof T]: Codec<T[K], {
            [k in keyof T]?: string | number | boolean | any[] | {
                [k: string]: any;
            } | null | undefined;
        }[K] | undefined>;
    } | {
        codecs: {
            [K in keyof T]: Codec<T[K], {
                [k in keyof T]?: string | number | boolean | any[] | {
                    [k: string]: any;
                } | null | undefined;
            }[K] | undefined>;
        };
    }, factory?: ((args: T) => T) | undefined) => Codec<T, {
        [k in keyof T]?: string | number | boolean | any[] | {
            [k: string]: any;
        } | null | undefined;
    }> & {
        codecs: {
            [K in keyof T]: Codec<T[K], {
                [k in keyof T]?: string | number | boolean | any[] | {
                    [k: string]: any;
                } | null | undefined;
            }[K] | undefined>;
        };
    };
    partialObject: <T>(codecsOrMap: {
        [K in keyof T]: Codec<T[K], {
            [k in keyof T]?: string | number | boolean | any[] | {
                [k: string]: any;
            } | null | undefined;
        }[K] | undefined>;
    } | {
        codecs: {
            [K in keyof T]: Codec<T[K], {
                [k in keyof T]?: string | number | boolean | any[] | {
                    [k: string]: any;
                } | null | undefined;
            }[K] | undefined>;
        };
    }, maybeFactory?: ((args: Partial<T>) => Partial<T>) | undefined) => Codec<Partial<T>, {
        [k in keyof T]?: string | number | boolean | any[] | {
            [k: string]: any;
        } | null | undefined;
    }> & {
        codecs: {
            [K in keyof T]: Codec<T[K], {
                [k in keyof T]?: string | number | boolean | any[] | {
                    [k: string]: any;
                } | null | undefined;
            }[K] | undefined>;
        };
    };
    record: <T, TRecord extends Record<T>>(ctor: new (params?: Partial<T> | undefined) => TRecord, map: {
        [K in keyof T]: Codec<T[K], {
            [k in keyof T]?: string | number | boolean | any[] | {
                [k: string]: any;
            } | null | undefined;
        }[K] | undefined>;
    } | {
        codecs: {
            [K in keyof T]: Codec<T[K], {
                [k in keyof T]?: string | number | boolean | any[] | {
                    [k: string]: any;
                } | null | undefined;
            }[K] | undefined>;
        };
    }) => Codec<TRecord, {
        [k in keyof T]?: string | number | boolean | any[] | {
            [k: string]: any;
        } | null | undefined;
    }> & {
        codecs: {
            [K in keyof T]: Codec<T[K], {
                [k in keyof T]?: string | number | boolean | any[] | {
                    [k: string]: any;
                } | null | undefined;
            }[K] | undefined>;
        };
    };
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
