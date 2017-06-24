"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("caesium-core/lang");
const codec_1 = require("caesium-core/codec");
// tODO: Move these definitions to caesium-core.
function assertNotNull(value) {
    if (lang_1.isBlank(value))
        throw new codec_1.EncodingException('Value cannot be null');
}
exports.assertNotNull = assertNotNull;
exports.error = {
    encode: (_) => {
        throw new codec_1.EncodingException('A codec was not provided');
    },
    decode: (_) => {
        throw new codec_1.EncodingException('A codec was not provided');
    }
};
exports.nullSafeIdentity = {
    encode: (input) => {
        assertNotNull(input);
        return input;
    },
    decode: (input) => {
        assertNotNull(input);
        return input;
    }
};
