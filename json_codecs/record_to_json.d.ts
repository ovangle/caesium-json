import { JsonObject } from './interfaces';
import { Codec } from 'caesium-core/codec';
export declare function recordCodec<T>(valueCodecs: {
    [propName: string]: Codec<any, any>;
}, recordFactory: (args: {
    [prop: string]: any;
}) => T): Codec<T, JsonObject>;
