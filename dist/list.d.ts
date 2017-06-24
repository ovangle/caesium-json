import { List } from 'immutable';
import { Codec } from 'caesium-core/codec';
import { Json } from './interfaces';
export declare function list<T>(itemCodec: Codec<T, Json>): Codec<List<T>, Json>;
