import {Stack} from 'immutable';

import {Converter} from 'caesium-core/converter'
import {Codec} from 'caesium-core/codec';

import {RequestMethod} from 'angular2/http';

import {responseDecoder, JsonObject, JsonResponse} from './interfaces';
import {BaseRequest, BaseRequestOptions} from './abstract_request';
import {ModelHttp} from './model_http';
import {SearchParameter} from './search/parameter';
import {SearchParameterMap} from './search/parameter_map';
import {SearchResponse, SearchResponsePage} from './search/search_response';

export interface SearchOptions<T> extends BaseRequestOptions {
    parameters: {[name: string]: SearchParameter};
    responseDecoder: Codec<T,JsonObject> | Converter<JsonObject,T>;
}

// TODO: Search<T> should extend AccessorRequest
// TODO: SearchOptions should not define responseDecoder.
export class Search<T> extends BaseRequest {
    pageSize: number;

    private _responses: Stack<SearchResponse<T>>;

    private _responseDecoder: Converter<JsonObject,T>;

    get response(): SearchResponse<T> {
        // There will always be at least one item in the result stack.
        return this._responses.first();
    }

    constructor(options: SearchOptions<T>, kind: string, pageSize: number, http: ModelHttp) {
        super(options, kind, http);
        this.pageSize = pageSize;
        this._responseDecoder = responseDecoder(options.responseDecoder);

        var params = new SearchParameterMap(options.parameters);
        this._responses = Stack<SearchResponse<T>>()
            .unshift(new SearchResponse<T>(params, this.pageSize));
    }

    /// Load a single page of results from the current result
    send(): Promise<number> {
        var response = this.response;
        return response.addPendingPage(response.nextPageId.then((pageId) => {
            var params = response.parameters.valuesToStringMap();
            params['p'] = `${pageId}`;

            return this._submitRequest(params).then((rawResponse:JsonResponse) => {
                this.emit(rawResponse);
                return new SearchResponsePage(
                    rawResponse,
                    this._responseDecoder,
                    response.parameters
                );
            });
        }));
    }

    private _submitRequest(params: {[param: string]: string}): Promise<JsonResponse> {
        return this.http.request({
            method: RequestMethod.Get,
            kind: this.kind,
            endpoint: this.endpoint,
            params: params
        }).toPromise();
    }

    getParamValue(param: string, notSetValue?: any): any {
        return this.response.parameters.get(param, notSetValue);
    }

    hasParamValue(param: string): boolean {
        return this.response.parameters.has(param);
    }

    deleteParamValue(param: string): void {
        var params = this.response.parameters.delete(param);
        this._rebuildResponseStack(params);
    }

    setParamValue(param: string, value: any): void {
        var params = this.response.parameters.set(param, value);
        this._rebuildResponseStack(params);
    }

    private _rebuildResponseStack(params: SearchParameterMap) {
        // If the user reverts to a previous parameter state, (say, by deleting some of the input)
        // then we roll back the stack until we find a cached result set that still matches the
        // new input.
        // It is very unlikely that a user will erase some input just to add it back again,
        // but it's not practical to keep the cache around indefinitely
        var keepResponses = this._responses
            .skipWhile((response) => !params.isRefinementOf(response.parameters))
            .toStack();

        var newResponse = new SearchResponse(
            params,
            this.pageSize,
            keepResponses.first().pages
        );

        this._responses = keepResponses.unshift(newResponse);
    }
}
