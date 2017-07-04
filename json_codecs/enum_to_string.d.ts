import { Iterable } from 'immutable';
import { Codec } from 'caesium-core/codec';
/**
 * Converts an enum to a string.
 *
 * An enum value can never be `null`, either on serialization or deserialization.
 *
 * @param serializedValues
 * A Map of the enum constants to their serialized string values.
 */
export declare function enumToString<T>(serializedValues: Iterable.Keyed<T, string>): Codec<T, string>;
