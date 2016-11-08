import {Injectable} from '@angular/core';

import {Type} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';

import {JsonObject} from '../json_codecs';

import {modelResolver} from './reflection';
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
    private modelResolver = modelResolver;

    constructor(private types: Type[]) {

        for (let type of types) {
            // Resolve and cache the type, throw if any model errors.
            // We want to catch model errors as early as possible
            this.modelResolver.resolve(type);
        }
    }

    getMetadata(type: Type): ModelMetadata {
        return modelResolver.resolve(type);
    }

    getMetadataForInstance(instance: ModelBase): ModelMetadata {
        let type = getType(instance);
        return modelResolver.resolve(type);
    }

    /**
    getJsonCodec<T>(type: Type): Codec<T, JsonObject> {
        let metadata = this.getMetadata(type);
        return metadata.jsonCodec;

    }
     */
}
