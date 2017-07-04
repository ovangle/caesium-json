import { Type } from 'caesium-core/lang';
import { Codec } from 'caesium-core/codec';
import { JsonObject } from './interfaces';
import { ModelBase } from '../model/base';
export declare function model<T extends ModelBase>(modelType: Type<T>): Codec<T, JsonObject>;
