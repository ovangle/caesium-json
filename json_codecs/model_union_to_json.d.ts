import { Type } from 'caesium-core/lang';
import { Codec } from 'caesium-core/codec';
import { JsonObject } from './interfaces';
export declare function union(...types: Type<any>[]): Codec<any, JsonObject>;
