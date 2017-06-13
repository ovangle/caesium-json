import {isBlank} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';
import {Codec, getEncoder, isCodec} from 'caesium-core/codec';

import {JsonObject} from '../../json_codecs/interfaces';

import {ModelMetadata} from '../../model/metadata';
import {ModelHttp} from '../model_http';

import {Get} from './get';
import {Put} from './put';
import {Post} from './post';
import {Delete} from './delete';

export class RequestFactory {
    http: ModelHttp;
    modelMetadata: ModelMetadata<any>;

    constructor(
        http: ModelHttp,
        modelMetadata: ModelMetadata<any>
    ) {
        this.http = http;
        this.modelMetadata = modelMetadata;
    }

    get(endpoint: string, withCredentials?: boolean) {
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new Get(this.http, this.modelMetadata.kind, endpoint, withCredentials);
    }

    put<U>(endpoint: string, bodyEncoder: Codec<U,JsonObject>|Converter<U,JsonObject>,
            withCredentials?: boolean) {
        var encoder = this.getEncoder(bodyEncoder);
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new Put<U>(this.http, this.modelMetadata.kind, endpoint,
                          encoder, withCredentials);
    }

    post<U>(endpoint: string, bodyEncoder: Codec<U, JsonObject>|Converter<U,JsonObject>,
            withCredentials?: boolean) {
        var encoder = this.getEncoder(bodyEncoder);
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new Post<U>(this.http, this.modelMetadata.kind, endpoint, encoder, withCredentials);
    }

    delete(endpoint: string, withCredentials?: boolean) {
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new Delete(this.http, this.modelMetadata.kind, endpoint, withCredentials);
    }

    private getEncoder<T>(encoder: Codec<T,JsonObject>|Converter<T,JsonObject>): Converter<T,JsonObject> {
        if (isCodec(encoder)) {
            return getEncoder(encoder as Codec<T,JsonObject>);
        } else {
            return encoder as Converter<T,JsonObject>;
        }
    }

    private withCredentialsDefault(withCredentials?: boolean) {
        return isBlank(withCredentials) ? true : withCredentials;
    }
}
