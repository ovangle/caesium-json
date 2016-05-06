import {Type, isBlank} from 'caesium-core/lang';
import {Codec, composeCodecs} from 'caesium-core/codec';

import {JsonObject} from './interfaces';
import {ModelMetadata} from '../model/metadata';
import {ModelBase} from '../model/base';
import {createModelFactory} from '../model/factory';
import {PropertyCodec} from './model_property_to_json';
import {objectToJson, jsonToObject} from './object_to_json';

function propertyCodecs(modelMetadata: ModelMetadata): Immutable.Map<string,PropertyCodec> {
    return modelMetadata.properties
        .map((propertyMeta) => new PropertyCodec(propertyMeta))
        .toMap();
}

/**
 * The `kind` property of a model is treated as if it only exists on
 * the model's metadata.
 *
 * This encoder just deletes the kind property from incoming json objects
 * and adds it back into the outgoing objects.
 */
function kindPropertyRemover(metadata: ModelMetadata): Codec<JsonObject,JsonObject>{
    return {
        encode: (obj) => {
            if (isBlank(obj)) return obj;
            obj['kind'] = metadata.kind;
            return obj;
        },
        decode: (obj) => {
            if (isBlank(obj)) return obj;
            delete obj['kind'];
            return obj;
        }
    }
}

export function model<T extends ModelBase>(modelType: Type): Codec<T,JsonObject> {
    var metadata = ModelMetadata.forType(modelType);
    var propCodecs = propertyCodecs(metadata);

    var modelPropertyEncoder = objectToJson<T>(
        (propName: string) => {
            //TODO: Should have a getEncoder function in caesium-core/codec.
            var propCodec = propCodecs.get(propName);
            return propCodec.encode.bind(propCodec);
        }
    );
    var modelPropertyDecoder = jsonToObject<T>(
        (propName: string) => {
            //TODO: Should have a getDecoder function in caesium-core/codec.
            var propCodec = propCodecs.get(propName);
            return propCodec.decode.bind(propCodec);
        },
        createModelFactory<T>(metadata)
    );
    return composeCodecs<T,JsonObject,JsonObject>(
        {encode: modelPropertyEncoder, decode: modelPropertyDecoder},
        kindPropertyRemover(metadata)
    );
}

