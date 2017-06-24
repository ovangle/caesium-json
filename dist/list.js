"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const codec_1 = require("caesium-core/codec");
function list(itemCodec) {
    return {
        encode: (list) => {
            if (lang_1.isBlank(list))
                throw new codec_1.EncodingException('Expected list, got blank value');
            return list
                .map((item) => itemCodec.encode(item))
                .toArray();
        },
        decode: (jsonList) => {
            if (lang_1.isBlank(jsonList))
                throw new codec_1.EncodingException('Expected array, got blank value');
            return immutable_1.List(jsonList)
                .map((item) => itemCodec.decode(item))
                .toList();
        }
    };
}
exports.list = list;
