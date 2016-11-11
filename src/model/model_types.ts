import {Injectable} from '@angular/core';

import {Type} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';

import {JsonObject} from '../json_codecs';

import {ModelMetadata} from './metadata';
import {ModelBase} from './base';


function getType(instance: any): Type {
    return Object.getPrototypeOf(instance).constructor;
}

/**
 * TOD Test.
 */

@Injectable()
export class ModelTypes {

    private getMetadata(type: Type): ModelMetadata {
        return ModelMetadata.forType(type);
    }

    private getMetadataForInstance(instance: ModelBase): ModelMetadata {
        return ModelMetadata.forInstance(instance);
    }

    /**
    getJsonCodec<T>(type: Type): Codec<T, JsonObject> {
        let metadata = this.getMetadata(type);
        return metadata.jsonCodec;

    }
     */
}
