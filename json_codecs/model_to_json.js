"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const codec_1 = require("caesium-core/codec");
const metadata_1 = require("../model/metadata");
const factory_1 = require("../model/factory");
const model_property_to_json_1 = require("./model_property_to_json");
const object_to_json_1 = require("./object_to_json");
function propertyCodecs(modelMetadata) {
    var propCodecs = modelMetadata.properties
        .map((propertyMeta) => new model_property_to_json_1.PropertyCodec(propertyMeta))
        .toMap();
    var refCodecs = immutable_1.Map(modelMetadata.properties
        .filter(propertyMeta => propertyMeta.isRef)
        .map((propertyMeta) => [propertyMeta.refName, new model_property_to_json_1.RefPropertyCodec(propertyMeta)])
        .valueSeq());
    return propCodecs.merge(refCodecs);
}
/**
 * The `kind` property of a model is treated as if it only exists on
 * the model's metadata.
 *
 * This encoder just deletes the kind property from incoming json objects
 * and adds it back into the outgoing objects.
 */
function kindPropertyRemover(metadata) {
    return {
        encode: (obj) => {
            if (lang_1.isBlank(obj))
                return obj;
            obj = Object.assign({}, obj);
            obj['kind'] = metadata.kind;
            return obj;
        },
        decode: (obj) => {
            if (lang_1.isBlank(obj))
                return obj;
            obj = Object.assign({}, obj);
            delete obj['kind'];
            return obj;
        }
    };
}
function model(modelType) {
    var metadata = metadata_1.ModelMetadata.forType(modelType);
    var propCodecs = propertyCodecs(metadata);
    var encodeProperties = metadata.properties.keySeq()
        .concat(metadata.refNameMap.keySeq());
    var modelPropertyEncoder = object_to_json_1.objectToJson(encodeProperties, (propNameOrRefName) => codec_1.getEncoder(propCodecs.get(propNameOrRefName)));
    var modelPropertyDecoder = object_to_json_1.jsonToObject(encodeProperties, (propNameOrRefName) => codec_1.getDecoder(propCodecs.get(propNameOrRefName)), factory_1.modelFactory(metadata.type));
    return codec_1.composeCodecs({ encode: modelPropertyEncoder, decode: modelPropertyDecoder }, kindPropertyRemover(metadata));
}
exports.model = model;
//# sourceMappingURL=model_to_json.js.map