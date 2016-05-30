import {Converter} from 'caesium-core/converter';
import {Codec} from 'caesium-core/codec';

import {JsonObject} from '../../json_codecs/interfaces';

import {ModelMetadata} from '../../model/metadata';
import {ModelHttp} from '../model_http';

import {Get} from './get';
import {Put} from './put';
import {Post} from './post';
import {Delete} from './delete';

export class RequestFactory {
    http: ModelHttp;
    modelMetadata: ModelMetadata;

    constructor(
        http: ModelHttp,
        modelMetadata: ModelMetadata
    ) {
        this.http = http;
        this.modelMetadata = modelMetadata;
    }

    get(endpoint: string) {
        return new Get(this.http, this.modelMetadata.kind, endpoint);
    }

    put<T>(endpoint: string, bodyEncoder: Codec<T,JsonObject>|Converter<T,JsonObject>) {
        return new Put<T>(this.http, this.modelMetadata.kind, endpoint, bodyEncoder);
    }

    post<T>(endpoint: string, bodyEncoder: Codec<T, JsonObject>|Converter<T,JsonObject>) {
        return new Post<T>(this.http, this.modelMetadata.kind, endpoint, bodyEncoder);
    }

    delete(endpoint: string) {
        return new Delete(this.http, this.modelMetadata.kind, endpoint);
    }
}
