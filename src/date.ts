import moment from 'moment';

import {Codec, EncodingException} from 'caesium-core/codec';

import {assertNotNull} from './utils';

/**
 * Codec between string representing a calendar date with no time information.
 *
 * It is assumed that the date passed from the server represents UTC midnight
 * on the specified day.
 *
 * @type {{encode: ((date:Date)=>(any|string)); decode: ((value:string)=>(any|Date))}}
 */
export const date: Codec<Date,string> = {
    encode: (date: Date) => {
        assertNotNull(date);
        var m = moment(date);
        return m.utc().format('YYYY-MM-DD');
    },
    decode: (value: string) => {
        assertNotNull(value);
        var m = moment.utc(value, 'YYYY-MM-DD', true);
        if (!m.isValid()) {
            throw new EncodingException(`Not a valid date format (use YYYY-MM-DD) ${value}`)
        }
        return m.toDate();
    }
};

export const dateTime: Codec<Date,string> = {
    encode: (date: Date) => {
        assertNotNull(date);
        return date.toISOString();
    },
    decode: (value: string) => {
        assertNotNull(value);
        var m = moment(value, moment.ISO_8601, true);
        if (!m.isValid()) {
            throw new EncodingException(`Invalid iso8601 datetime (${value})`);
        }
        return m.toDate();
    }
};