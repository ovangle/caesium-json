import moment = require('moment');
import {Moment} from 'moment';

import {List, Map} from 'immutable';
import {isBlank} from 'caesium-core/lang';
import {Codec, identity} from 'caesium-core/codec';

import {JsonObject} from "./interfaces";
import {EncodingException} from '../exceptions';

export const errorCodec: Codec<any,any> = {
    encode: (_) => {
        throw new Error('A codec was not provided');
    },
    decode: (_) => {
        throw new Error('A codec was not provided');
    }
}




export const str: Codec<string,string> = identity;
export const num: Codec<number,number> = identity;
export const bool: Codec<boolean,boolean> = identity;

export const date: Codec<Date,string> = {
    encode: (date: Date) => {
        if (isBlank(date))
            return date as any;
        var m = moment(date);
        return m.format('YYYY-MM-DD');
    },
    decode: (value: string) => {
        if (isBlank(value))
            return value as any;
        var m = moment(value, 'YYYY-MM-DD', true);
        if (!m.isValid()) {
            throw new EncodingException(`Not a valid date format (use YYYY-MM-DD) ${value}`)
        }
        return m.toDate();
    }
};

export const dateTime: Codec<Date,string> = {
    encode: (date: Date) => {
        if (isBlank(date))
            return date as any;
        return date.toISOString();
    },
    decode: (value: string) => {
        if (isBlank(value))
            return value as any;
        var m: Moment = moment(value, moment.ISO_8601, true);
        if (!m.isValid()) {
            throw new EncodingException(`Invalid iso8601 datetime (${str}`);
        }
        return m.toDate();
    }
};


class _ListCodec<T> implements Codec<List<T>, any[]> {
    itemCodec: Codec<T,any>;

    constructor(itemCodec: Codec<T,any>) {
        this.itemCodec = itemCodec;
    }

    encode(list: List<T>): any[] {
        if (isBlank(list))
            throw new EncodingException('Expected list, got blank value');
        return list
            .map((item) => this.itemCodec.encode(item))
            .toArray();
    }

    decode(jsonList: any[]): List<T> {
        if (isBlank(jsonList))
            throw new EncodingException('Expected list, got blank value');
        return List<T>(jsonList)
            .map((item) => this.itemCodec.decode(item))
            .toList();
    }
}

export function list<T>(itemCodec: Codec<T,any>): Codec<List<T>,any[]> {
    return new _ListCodec(itemCodec);
}

class _MapCodec<T> implements Codec<Map<string,T>,JsonObject> {
    valueCodec: Codec<T,any>;

    constructor(valueCodec: Codec<T,any>) {
        this.valueCodec = valueCodec;
    }

    encode(map: Map<string,T>): JsonObject {
        if (isBlank(map))
            throw new EncodingException('Expected map, got blank value');
        return map
            .map((value) => this.valueCodec.encode(value))
            .toObject();
    }

    decode(json: JsonObject): Map<string,T> {
        if (isBlank(json))
            throw new EncodingException('Expected object, got blank value');
        return Map(json)
            .map((value) => this.valueCodec.decode(value))
            .toMap();
    }
}

export function map<T>(valueCodec: Codec<T,any>): Codec<Map<string,T>,JsonObject> {
    return new _MapCodec<T>(valueCodec);
}
