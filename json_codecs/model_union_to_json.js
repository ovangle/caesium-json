"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../exceptions");
const metadata_1 = require("../model/metadata");
const model_to_json_1 = require("./model_to_json");
class UnionCodec {
    constructor(...types) {
        var modelCodecs = immutable_1.Map(types.map((type) => [type, model_to_json_1.model(type)]));
        this._modelEncoders = modelCodecs
            .map((codec) => codec.encode.bind(codec))
            .toMap();
        this._kindDecoders = immutable_1.Map(modelCodecs.map((codec, type) => {
            var metadata = metadata_1.ModelMetadata.forType(type);
            var modelCodec = modelCodecs.get(type);
            return [metadata.kind, modelCodec.decode.bind(modelCodec)];
        }).valueSeq());
    }
    encode(obj) {
        if (lang_1.isBlank(obj))
            return obj;
        var instanceType = this._modelEncoders.keySeq()
            .find((type) => obj instanceof type);
        if (lang_1.isBlank(instanceType))
            throw new exceptions_1.EncodingException(`Cannot encode ${obj}: The object was not an instance of any of the types in this union`);
        return this._modelEncoders.get(instanceType)(obj);
    }
    decode(json) {
        if (lang_1.isBlank(json))
            return json;
        var kind = json['kind'];
        if (lang_1.isBlank(kind))
            throw new exceptions_1.EncodingException(`No 'kind' present on encoded object`);
        if (!this._kindDecoders.has(kind))
            throw new exceptions_1.EncodingException(`Cannot decode ${json}: The kind of the object was not associated with any of the types in this union`);
        return this._kindDecoders.get(kind)(json);
    }
}
function union(...types) {
    return new UnionCodec(...types);
}
exports.union = union;
//# sourceMappingURL=model_union_to_json.js.map