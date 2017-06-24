"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const codec_1 = require("caesium-core/codec");
const primitives_1 = require("./primitives");
function map(valueCodec, keyCodec) {
    const _keyCodec = keyCodec || primitives_1.str;
    return {
        encode: (map) => {
            if (lang_1.isBlank(map))
                throw new codec_1.EncodingException('Expected map, got blank value');
            return map
                .mapEntries(([key, value]) => [_keyCodec.encode(key), valueCodec.encode(value)])
                .toObject();
        },
        decode: (json) => {
            if (lang_1.isBlank(json))
                throw new codec_1.EncodingException('Expected object, got blank value');
            const map = immutable_1.Map(json)
                .mapEntries(([key, value]) => [_keyCodec.decode(key), valueCodec.decode(value)]);
            return map;
        }
    };
}
exports.map = map;
