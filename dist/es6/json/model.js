import { Map } from 'immutable';
import { assertNotNull } from '../utils';
import { str } from './primitives';
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
        assertNotNull(model);
        return this.properties
            .mapEntries(([key, property]) => {
            const options = propertyOptions(property);
            const valueCodec = propertyCodec(property);
            const objKey = this.propKey.encode(key);
            const modelValue = model.get(key, undefined);
            if (modelValue === undefined) {
                if (options.required)
                    throw new Error(`Required property '${key}' of '${this.typeName}' codec not present on model`);
                return [objKey, undefined];
            }
            return [objKey, valueCodec.encode(modelValue)];
        })
            .filter((v) => v !== undefined)
            .toObject();
    }
    decode(obj) {
        assertNotNull(obj);
        for (let key of Object.keys(obj)) {
            const modelKey = this.propKey.decode(key);
            if (!this.properties.has(modelKey))
                throw new Error(`'${modelKey}' not found on '${this.typeName}' codec`);
        }
        const modelArgs = this.properties
            .mapEntries(([key, property]) => {
            const options = propertyOptions(property);
            const valueCodec = propertyCodec(property);
            const objKey = this.propKey.encode(key);
            const objValue = obj[objKey];
            if (objValue === undefined) {
                if (options.required)
                    throw new Error(`Required property '${key}' of '${this.typeName}' codec not present on object`);
                return [key, undefined];
            }
            return [key, valueCodec.decode(objValue)];
        })
            .filter((v) => v !== undefined)
            .toObject();
        return new this.type(modelArgs);
    }
}
export function model(type, properties, keyCodec) {
    return new ModelCodec(type, Map(properties), keyCodec || str);
}
