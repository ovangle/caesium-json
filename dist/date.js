"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = require("moment");
const codec_1 = require("caesium-core/codec");
const utils_1 = require("./utils");
/**
 * Codec between string representing a calendar date with no time information.
 *
 * It is assumed that the date passed from the server represents UTC midnight
 * on the specified day.
 *
 * @type {{encode: ((date:Date)=>(any|string)); decode: ((value:string)=>(any|Date))}}
 */
exports.date = {
    encode: (date) => {
        utils_1.assertNotNull(date);
        var m = moment_1.default(date);
        return m.utc().format('YYYY-MM-DD');
    },
    decode: (value) => {
        utils_1.assertNotNull(value);
        var m = moment_1.default.utc(value, 'YYYY-MM-DD', true);
        if (!m.isValid()) {
            throw new codec_1.EncodingException(`Not a valid date format (use YYYY-MM-DD) ${value}`);
        }
        return m.toDate();
    }
};
exports.dateTime = {
    encode: (date) => {
        utils_1.assertNotNull(date);
        return date.toISOString();
    },
    decode: (value) => {
        utils_1.assertNotNull(value);
        var m = moment_1.default(value, moment_1.default.ISO_8601, true);
        if (!m.isValid()) {
            throw new codec_1.EncodingException(`Invalid iso8601 datetime (${value})`);
        }
        return m.toDate();
    }
};
