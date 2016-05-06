import {Type, isBlank} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';
import {Codec} from 'caesium-core/codec';

import {JsonObject} from './interfaces';
import {EncodingException} from '../exceptions';
import {ModelMetadata} from '../model/metadata';
import {model} from './model_to_json';

class UnionCodec implements Codec<any,JsonObject> {

    private _modelEncoders: Immutable.Map<Type, Converter<any,JsonObject>>;
    private _kindDecoders: Immutable.Map<string, Converter<JsonObject,any>>;

    constructor(...types: Type[]) {
        var modelCodecs = Immutable.Map<Type, Codec<any,JsonObject>>(
            types.map((type) => [type, model(type)])
        );

        this._modelEncoders = modelCodecs
            .map((codec) => codec.encode.bind(codec))
            .toMap();
        this._kindDecoders = Immutable.Map<string,Converter<JsonObject,any>>(
            modelCodecs.map((codec, type) => {
                var metadata = ModelMetadata.forType(type);
                var modelCodec = modelCodecs.get(type);
                return [metadata.kind, modelCodec.decode.bind(modelCodec)];
            }).valueSeq()
        );
    }

    encode(obj: any): JsonObject {
        if (isBlank(obj))
            return obj;
        var instanceType = this._modelEncoders.keySeq()
            .find((type) => obj instanceof type);
        if (isBlank(instanceType))
            throw new EncodingException(`Cannot encode ${obj}: The object was not an instance of any of the types in this union`);
        return this._modelEncoders.get(instanceType)(obj);
    }

    decode(json: JsonObject): any {
        if (isBlank(json))
            return json;
        var kind = json['kind'];
        if (isBlank(kind))
            throw new EncodingException(`No 'kind' present on encoded object`);
        if (!this._kindDecoders.has(kind))
            throw new EncodingException(`Cannot decode ${json}: The kind of the object was not associated with any of the types in this union`);
        return this._kindDecoders.get(kind)(json);
    }
}

export function union(...types: Type[]): Codec<any,JsonObject> {
    return new UnionCodec(...types);
}

