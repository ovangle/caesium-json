import {Iterable} from 'immutable';
import {isBlank} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';
import {EncodingException} from './exceptions';

/**
 * Converts an enum to a string.
 *
 * An enum value can never be `null`, either on serialization or deserialization.
 *
 * @param serializedValues
 * A Map of the enum constants to their serialized string values.
 */
export function enumToString<T>(serializedValues: Iterable.Keyed<T,string>): Codec<T,string> {
    var valuesToKeys = serializedValues.flip();
    return {
        encode: (input: T) => {
            if (isBlank(input))
                return input as any;
            return serializedValues.get(input);
        },
        decode: (input: string) => {
            if (isBlank(input))
                return input as any;
            if (!valuesToKeys.has(input))
                throw new EncodingException(`Unrecognised enum value: ${input}`);
            return valuesToKeys.get(input);
        }
    }

}
