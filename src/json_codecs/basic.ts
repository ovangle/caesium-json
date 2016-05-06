import {isBlank, forEachOwnProperty} from 'caesium-core/lang';
import {Codec, identity} from 'caesium-core/codec';

import {JsonObject} from "./interfaces";
import {EncodingException} from '../exceptions';


export const str: Codec<string,string> = identity;
export const num: Codec<number,number> = identity;
export const bool: Codec<boolean,boolean> = identity;

export const date: Codec<Date,string> = {
    encode: (date: Date) => {
        if (isBlank(date))
            return date as any;
        return date.toISOString();
    },
    decode: (value: string) => {
        if (isBlank(value))
            return value as any;

        var d = Date.parse(value);
        if (isNaN(d))
            throw new EncodingException(`invalid iso8601 date (${str})`);
        return new Date(d);
    }
};


class _ListCodec<T> implements Codec<Immutable.List<T>, any[]> {
    itemCodec: Codec<T,any>;

    constructor(itemCodec: Codec<T,any>) {
        this.itemCodec = itemCodec;
    }

    encode(list: Immutable.List<T>): any[] {
        if (isBlank(list))
            throw new EncodingException('Expected list, got blank value');
        return list
            .map((item) => this.itemCodec.encode(item))
            .toArray();
    }

    decode(jsonList: any[]): Immutable.List<T> {
        if (isBlank(jsonList))
            throw new EncodingException('Expected list, got blank value');
        return Immutable.List<T>(jsonList)
            .map((item) => this.itemCodec.decode(item))
            .toList();
    }
}

export function list<T>(itemCodec: Codec<T,any>): Codec<Immutable.List<T>,any[]> {
    return new _ListCodec(itemCodec);
}

class _MapCodec<T> implements Codec<Immutable.Map<string,T>,JsonObject> {
    valueCodec: Codec<T,any>;

    constructor(valueCodec: Codec<T,any>) {
        this.valueCodec = valueCodec;
    }

    encode(map: Immutable.Map<string,T>): JsonObject {
        if (isBlank(map))
            throw new EncodingException('Expected map, got blank value');
        return map
            .map((value) => this.valueCodec.encode(value))
            .toObject();
    }

    decode(json: JsonObject): Immutable.Map<string,T> {
        if (isBlank(json))
            throw new EncodingException('Expected object, got blank value');
        return Immutable.Map(json)
            .map((value) => this.valueCodec.decode(value))
            .toMap();
    }
}

export function map<T>(valueCodec: Codec<T,any>): Codec<Immutable.Map<string,T>,JsonObject> {
    return new _MapCodec<T>(valueCodec);
}
