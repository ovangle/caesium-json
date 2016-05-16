import {RequestMethod} from 'angular2/http';

import {Codec, isCodec, getDecoder, getEncoder} from 'caesium-core/codec';
import {Converter} from 'caesium-core/converter';
import {JsonObject, JsonQuery, isJsonQuery} from '../json_codecs/interfaces';

export {JsonObject, JsonQuery, isJsonQuery};

export interface AbstractResponse {
    status: number;
}

export interface RequestBody<T> {
    body: T;
    encoder: Codec<T,JsonObject> | Converter<T,JsonObject>;
}


export function bodyEncoder<T>(requestBody: RequestBody<T>): Converter<T,JsonObject> {
    if (isCodec(requestBody.encoder)) {
        return getEncoder(requestBody.encoder as Codec<T,JsonObject>);
    } else {
        return requestBody.encoder as Converter<T,JsonObject>;
    }
}

export type ResponseFilter = (response: JsonResponse) => boolean;

export interface BaseResponseHandler<T> {
    /**
     * Call the response handler with the (possibly parsed)
     * response body.
     *
     * Depending on whether the request is single item (eg. Get, Put, Post)
     * or multi-item (eg. Search), this handler may be called multiple
     * times per response
     * @param body
     */
    call(body: T): any;
    /**
     * The `this` inside the `call` handler.
     */
    thisArg: any;
}

export interface DefaultResponseHandler extends ResponseHandler<JsonObject|JsonQuery> {}

export interface ResponseHandler<T> extends BaseResponseHandler<T> {
    /**
     * Returns `true` if this handler should handle the response.
     * If two handlers return `true` for the same response, the first
     * registered handler will be called.
     */
    selector: number | ResponseFilter;
    decoder: Codec<T,JsonObject> | Converter<JsonObject, T>;
}

export function filterStatus(status: number): ResponseFilter {
    return (response: JsonResponse) => response.status === status;
}

export function responseDecoder<T>(decoder: Codec<T,JsonObject> | Converter<JsonObject,T>): Converter<JsonObject,T> {
    if (isCodec(decoder)) {
        return getDecoder(decoder as Codec<T,JsonObject>);
    } else {
        return decoder as Converter<JsonObject,T>;
    }
}

export interface JsonRequestOptions {
    method: RequestMethod;
    kind: string;
    endpoint: string;
    params?: {[param: string]: string};
    body?: JsonObject;

}

export interface JsonResponse {
    status: number;
    body: JsonObject | JsonQuery;
}
