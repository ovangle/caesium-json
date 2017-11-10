import { Record } from 'immutable';
import { Codec } from '../codec';
import { Json } from './interfaces';
export interface PropertyOptions {
    required?: boolean;
}
export declare type Property = Codec<any, Json> | [Codec<any, Json>, PropertyOptions];
export interface ModelFactory<TProps, U extends Record<TProps>> {
    name?: string;
    new (props: Partial<TProps>): U;
}
export declare function model<TProps, TModel extends Record<TProps>>(type: ModelFactory<TProps, TModel>, properties: Partial<{
    [K in keyof TProps]: Property;
}>, keyCodec?: Codec<string, string>): Codec<TModel, Json>;
