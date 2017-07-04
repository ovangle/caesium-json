"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = require("moment");
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const codec_1 = require("caesium-core/codec");
const exceptions_1 = require("../exceptions");
exports.str = codec_1.identity;
exports.num = codec_1.identity;
exports.bool = codec_1.identity;
exports.date = {
    encode: (date) => {
        if (lang_1.isBlank(date))
            return date;
        var m = moment_1.default(date);
        return m.format('YYYY-MM-DD');
    },
    decode: (value) => {
        if (lang_1.isBlank(value))
            return value;
        var m = moment_1.default(value, 'YYYY-MM-DD', true);
        if (!m.isValid()) {
            throw new exceptions_1.EncodingException(`Not a valid date format (use YYYY-MM-DD) ${value}`);
        }
        return m.toDate();
    }
};
exports.dateTime = {
    encode: (date) => {
        if (lang_1.isBlank(date))
            return date;
        return date.toISOString();
    },
    decode: (value) => {
        if (lang_1.isBlank(value))
            return value;
        var m = moment_1.default(value, moment_1.default.ISO_8601, true);
        if (!m.isValid()) {
            throw new exceptions_1.EncodingException(`Invalid iso8601 datetime (${exports.str}`);
        }
        return m.toDate();
    }
};
class _ListCodec {
    constructor(itemCodec) {
        this.itemCodec = itemCodec;
    }
    encode(list) {
        if (lang_1.isBlank(list))
            throw new exceptions_1.EncodingException('Expected list, got blank value');
        return list
            .map((item) => this.itemCodec.encode(item))
            .toArray();
    }
    decode(jsonList) {
        if (lang_1.isBlank(jsonList))
            throw new exceptions_1.EncodingException('Expected list, got blank value');
        return immutable_1.List(jsonList)
            .map((item) => this.itemCodec.decode(item))
            .toList();
    }
}
function list(itemCodec) {
    return new _ListCodec(itemCodec);
}
exports.list = list;
class _MapCodec {
    constructor(valueCodec) {
        this.valueCodec = valueCodec;
    }
    encode(map) {
        if (lang_1.isBlank(map))
            throw new exceptions_1.EncodingException('Expected map, got blank value');
        return map
            .map((value) => this.valueCodec.encode(value))
            .toObject();
    }
    decode(json) {
        if (lang_1.isBlank(json))
            throw new exceptions_1.EncodingException('Expected object, got blank value');
        return immutable_1.Map(json)
            .map((value) => this.valueCodec.decode(value))
            .toMap();
    }
}
function map(valueCodec) {
    return new _MapCodec(valueCodec);
}
exports.map = map;
//# sourceMappingURL=basic.js.map