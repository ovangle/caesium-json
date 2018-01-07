import { Codec } from "./codec";
export declare type Json = boolean | number | string | any[] | {
    [k: string]: any;
};
export declare type JsonPrimitive = boolean | number | string;
export declare type JsonObject<T> = {
    [K in keyof T]: Json | null;
};
export declare type JsonArray = Array<Json>;
export declare const bool: Codec<boolean, boolean>;
export declare const num: Codec<number, number>;
export declare const str: Codec<string, string>;
export declare const date: Codec<Date, string>;
