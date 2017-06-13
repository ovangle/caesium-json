import {Map} from 'immutable';
import {Type, isBlank} from 'caesium-core/lang';
import {Codec, composeCodecs, getEncoder, getDecoder} from 'caesium-core/codec';

import {JsonObject} from './interfaces';
import {ModelMetadata, RefPropertyMetadata} from '../model/metadata';
import {ModelBase} from '../model/base';
import {modelFactory} from '../model/factory';
import {PropertyCodec, RefPropertyCodec} from './model_property_to_json';
import {objectToJson, jsonToObject} from './object_to_json';

function propertyCodecs(modelMetadata: ModelMetadata<any>): Map<string,Codec<any,any>> {
    var propCodecs = modelMetadata.properties
        .map((propertyMeta) => new PropertyCodec(propertyMeta))
        .toMap();

    var refCodecs = Map<string,RefPropertyCodec>(
        modelMetadata.properties
            .filter(propertyMeta => propertyMeta.isRef)
            .map((propertyMeta: RefPropertyMetadata) => [propertyMeta.refName, new RefPropertyCodec(propertyMeta)])
            .valueSeq()
    );

    return propCodecs.merge(refCodecs);
}

/**
 * The `kind` property of a model is treated as if it only exists on
 * the model's metadata.
 *
 * This encoder just deletes the kind property from incoming json objects
 * and adds it back into the outgoing objects.
 */
function kindPropertyRemover(metadata: ModelMetadata<any>): Codec<JsonObject,JsonObject>{
    return {
        encode: (obj) => {
            if (isBlank(obj)) return obj;

            obj = Object.assign({}, obj);
            obj['kind'] = metadata.kind;
            return obj;
        },
        decode: (obj) => {
            if (isBlank(obj)) return obj;

            obj = Object.assign({}, obj);
            delete obj['kind'];
            return obj;
        }
    }
}

export function model<T extends ModelBase>(modelType: Type<T>): Codec<T,JsonObject> {
    var metadata = ModelMetadata.forType(modelType);
    var propCodecs = propertyCodecs(metadata);

    var encodeProperties = metadata.properties.keySeq()
        .concat(metadata.refNameMap.keySeq());

    var modelPropertyEncoder = objectToJson<T>(
        encodeProperties,
        (propNameOrRefName: string) => getEncoder(propCodecs.get(propNameOrRefName))
    );
    var modelPropertyDecoder = jsonToObject<T>(
        encodeProperties,
        (propNameOrRefName: string) => getDecoder(propCodecs.get(propNameOrRefName)),
        modelFactory<T>(metadata.type)
    );
    return composeCodecs<T,JsonObject,JsonObject>(
        {encode: modelPropertyEncoder, decode: modelPropertyDecoder},
        kindPropertyRemover(metadata)
    );
}

