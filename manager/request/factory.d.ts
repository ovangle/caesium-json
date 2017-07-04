import { Converter } from 'caesium-core/converter';
import { Codec } from 'caesium-core/codec';
import { JsonObject } from '../../json_codecs/interfaces';
import { ModelMetadata } from '../../model/metadata';
import { ModelHttp } from '../model_http';
import { Get } from './get';
import { Put } from './put';
import { Post } from './post';
import { Delete } from './delete';
export declare class RequestFactory {
    http: ModelHttp;
    modelMetadata: ModelMetadata<any>;
    constructor(http: ModelHttp, modelMetadata: ModelMetadata<any>);
    get(endpoint: string, withCredentials?: boolean): Get;
    put<U>(endpoint: string, bodyEncoder: Codec<U, JsonObject> | Converter<U, JsonObject>, withCredentials?: boolean): Put<U>;
    post<U>(endpoint: string, bodyEncoder: Codec<U, JsonObject> | Converter<U, JsonObject>, withCredentials?: boolean): Post<U>;
    delete(endpoint: string, withCredentials?: boolean): Delete<{}>;
    private getEncoder<T>(encoder);
    private withCredentialsDefault(withCredentials?);
}
