import { List } from 'immutable';
import { Codec } from 'caesium-core/codec';
import { JsonObject } from './interfaces';
/**
 * Decodes an object of the form
 * {
 *  items: JsonObject[]
 * }
 *
 * into a List, using the given decoder
 */
export declare function itemList<T>(itemDecoder: Codec<T, JsonObject>): Codec<List<T>, JsonObject>;
