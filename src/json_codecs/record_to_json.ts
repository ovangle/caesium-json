import {JsonObject} from './interfaces';
import {Codec, getEncoder, getDecoder} from 'caesium-core/codec';
import {objectToJson, jsonToObject} from './object_to_json';

type Record = Immutable.Record.Class;

export function recordCodec<T>(
    valueCodecs: {[propName: string]: Codec<any,any>},
    recordFactory: (args: {[prop: string]: any}) => T
): Codec<T,JsonObject> {
    var _valueCodecs = Immutable.Map<string,Codec<any,any>>(valueCodecs);
    var encodeProperties = _valueCodecs.keySeq();
    
    var objToJson = objectToJson<T>(
        encodeProperties,
        (propName: string) => getEncoder(_valueCodecs.get(propName))
    );
    var jsonToObj = jsonToObject<T>(
        encodeProperties,
        (propName: string) => getDecoder(_valueCodecs.get(propName)),
        recordFactory
    );
    return {
        encode: (record: T) => objToJson(record),
        decode: (input: JsonObject) => jsonToObj(input)
    }
}

