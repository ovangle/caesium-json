import { Type } from 'caesium-core/lang';
import { Codec } from 'caesium-core/codec';
import { Json } from './interfaces';
export interface ModelType<T extends Model> extends Type<T> {
    new (args: {
        [k: string]: any;
    }): T;
}
export interface Model {
    get(key: string): any;
}
export interface PropertyOptions {
    required?: boolean;
}
export declare type Property = Codec<any, Json> | [Codec<any, Json>, PropertyOptions];
export declare function model<T extends Model>(type: ModelType<T>, properties: {
    [prop: string]: Property;
}, keyCodec?: Codec<string, string>): Codec<T, Json>;
