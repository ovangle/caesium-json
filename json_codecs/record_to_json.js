"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const codec_1 = require("caesium-core/codec");
const object_to_json_1 = require("./object_to_json");
function recordCodec(valueCodecs, recordFactory) {
    var _valueCodecs = immutable_1.Map(valueCodecs);
    var encodeProperties = _valueCodecs.keySeq();
    var objToJson = object_to_json_1.objectToJson(encodeProperties, (propName) => codec_1.getEncoder(_valueCodecs.get(propName)));
    var jsonToObj = object_to_json_1.jsonToObject(encodeProperties, (propName) => codec_1.getDecoder(_valueCodecs.get(propName)), recordFactory);
    return {
        encode: (record) => objToJson(record),
        decode: (input) => jsonToObj(input)
    };
}
exports.recordCodec = recordCodec;
//# sourceMappingURL=record_to_json.js.map