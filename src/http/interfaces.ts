import {Observable} from 'rxjs/Observable';

import {RequestMethod} from 'angular2/http';

import {Converter} from 'caesium-core/converter';
import {JsonObject, JsonQuery, StringMap} from '../json_codecs/interfaces';

export {JsonObject, JsonQuery};

export interface BaseRequestOptions {
    /// The endpoint of the method
    endpoint: string;
}


export interface JsonRequestOptions extends BaseRequestOptions {
    kind: string;
    method: RequestMethod;

    params?: StringMap;
    body?: JsonObject;
}

export interface AccessorRequestOptions<TResponse> extends BaseRequestOptions {
    responseDecoder: Converter<JsonObject,TResponse>;
}

export interface MutatorRequestOptions<TBody,TResponse> extends AccessorRequestOptions<TResponse> {
    bodyEncoder: Converter<TBody,JsonObject>;
}

export interface AbstractResponse {
    status: number;
}

export interface VoidResponse extends AbstractResponse {
}

export interface JsonResponse extends AbstractResponse {
    body: JsonObject | JsonQuery;
}

export interface SingleItemResponse<T> extends AbstractResponse {
    body:T;
}

export interface ResponsePage<T> extends AbstractResponse {
    body: Immutable.List<T>;
    pageId: number;
    lastPage: boolean;
}

