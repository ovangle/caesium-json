"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../exceptions");
/**
 * Converts an enum to a string.
 *
 * An enum value can never be `null`, either on serialization or deserialization.
 *
 * @param serializedValues
 * A Map of the enum constants to their serialized string values.
 */
function enumToString(serializedValues) {
    var valuesToKeys = serializedValues.flip();
    return {
        encode: (input) => {
            if (lang_1.isBlank(input))
                return input;
            return serializedValues.get(input);
        },
        decode: (input) => {
            if (lang_1.isBlank(input))
                return input;
            if (!valuesToKeys.has(input))
                throw new exceptions_1.EncodingException(`Unrecognised enum value: ${input}`);
            return valuesToKeys.get(input);
        }
    };
}
exports.enumToString = enumToString;
//# sourceMappingURL=enum_to_string.js.map