"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const codec_1 = require("caesium-core/codec");
const utils_1 = require("./utils");
const primitives_1 = require("./primitives");
const propertyOptionDefaults = {
    required: true
};
function propertyCodec(prop) {
    if (Array.isArray(prop)) {
        return prop[0];
    }
    else {
        return prop;
    }
}
function propertyOptions(prop) {
    if (Array.isArray(prop)) {
        return prop[1];
    }
    else {
        return propertyOptionDefaults;
    }
}
class ModelCodec {
    constructor(type, properties, propKey) {
        this.type = type;
        this.properties = properties;
        this.propKey = propKey;
    }
    get typeName() {
        return this.type.name;
    }
    encode(model) {
        utils_1.assertNotNull(model);
        return this.properties
            .mapEntries(([key, property]) => {
            const options = propertyOptions(property);
            const valueCodec = propertyCodec(property);
            const objKey = this.propKey.encode(key);
            const modelValue = model.get(key);
            if (modelValue === undefined) {
                if (options.required)
                    throw new codec_1.EncodingException(`Required property '${key}' of '${this.typeName}' codec not present on model`);
                return [objKey, undefined];
            }
            return [objKey, valueCodec.encode(modelValue)];
        })
            .filter((v) => v !== undefined)
            .toObject();
    }
    decode(obj) {
        utils_1.assertNotNull(obj);
        for (let key of Object.keys(obj)) {
            const modelKey = this.propKey.decode(key);
            if (!this.properties.has(modelKey))
                throw new codec_1.EncodingException(`'${modelKey}' not found on '${this.typeName}' codec`);
        }
        const modelArgs = this.properties
            .mapEntries(([key, property]) => {
            const options = propertyOptions(property);
            const valueCodec = propertyCodec(property);
            const objKey = this.propKey.encode(key);
            const objValue = obj[objKey];
            if (objValue === undefined) {
                if (options.required)
                    throw new codec_1.EncodingException(`Required property '${key}' of '${this.typeName}' codec not present on object`);
                return [key, undefined];
            }
            return [key, valueCodec.decode(objValue)];
        })
            .filter((v) => v !== undefined)
            .toObject();
        return new this.type(modelArgs);
    }
}
function model(type, properties, keyCodec) {
    return new ModelCodec(type, immutable_1.Map(properties), keyCodec || primitives_1.str);
}
exports.model = model;
