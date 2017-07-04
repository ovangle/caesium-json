"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../exceptions");
const string_case_converters_1 = require("./string_case_converters");
function objectToJson(encodeProperties, valueEncoder) {
    return (input) => {
        if (lang_1.isBlank(input))
            return input;
        var jsonObject = {};
        encodeProperties.forEach((propName) => {
            var encoder = valueEncoder(propName);
            var entryName = string_case_converters_1.camelCaseToSnakeCase(propName);
            if (lang_1.isBlank(encoder))
                throw new exceptions_1.EncodingException(`No encoder for ${propName}`);
            var value = input[propName];
            var encodedValue = encoder(value);
            // Drop undefined values from output
            if (lang_1.isDefined(encodedValue))
                jsonObject[entryName] = encodedValue;
        });
        return jsonObject;
    };
}
exports.objectToJson = objectToJson;
function jsonToObject(encodeProperties, valueDecoder, factory) {
    return (jsonObject) => {
        if (lang_1.isBlank(jsonObject))
            return jsonObject;
        var factoryArgs = {};
        encodeProperties.forEach((propName) => {
            var entryName = string_case_converters_1.camelCaseToSnakeCase(propName);
            var value = jsonObject[entryName];
            var decoder = valueDecoder(propName);
            if (lang_1.isBlank(decoder))
                throw new exceptions_1.EncodingException(`No decoder for ${propName}`);
            factoryArgs[propName] = decoder(value);
        });
        return factory(factoryArgs);
    };
}
exports.jsonToObject = jsonToObject;
//# sourceMappingURL=object_to_json.js.map