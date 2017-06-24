import { Map } from 'immutable';
import { Codec } from 'caesium-core/codec';
import { Json } from './interfaces';
export declare function map<K, V>(valueCodec: Codec<V, Json>, keyCodec?: Codec<K, string>): Codec<Map<K, V>, Json>;
