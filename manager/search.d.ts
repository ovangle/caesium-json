import { List } from 'immutable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { OpaqueToken } from '@angular/core';
import { Codec } from 'caesium-core/codec';
import { Converter } from 'caesium-core/converter';
import { JsonObject } from '../json_codecs/interfaces';
import { ModelHttp } from "./model_http";
import { SearchResult } from './search/result';
import { SearchParameter } from "./search/parameter";
import { SearchParameterMap } from './search/parameter_map';
import { RequestFactory } from "./request/factory";
export { SearchResult, SearchParameter };
export declare const SEARCH_PAGE_SIZE: OpaqueToken;
/**
 * The query parameter to set when requesting a particular
 * page of results.
 */
export declare const SEARCH_PAGE_QUERY_PARAM: OpaqueToken;
export interface SearchOptions {
    http: ModelHttp;
    kind: string;
    parameters: {
        [name: string]: SearchParameterMap;
    };
}
export declare class Search<T> {
    pageSize: number;
    pageQueryParam: string;
    itemDecoder: Converter<JsonObject, T>;
    _requestFactory: RequestFactory;
    protected _resultStack: List<SearchResult<T>>;
    protected _resultChange: Subject<SearchResult<T>>;
    protected _onReset: Subject<void>;
    private _parameterDefns;
    constructor(requestFactory: RequestFactory, parameters: SearchParameter[], itemDecoder: Codec<T, JsonObject> | Converter<JsonObject, T>, pageSize: number, pageQueryParam: string);
    readonly result: SearchResult<T>;
    readonly resultChange: Observable<SearchResult<T>>;
    readonly onReset: Observable<any>;
    getParamValue(param: string, notSetValue?: any): any;
    hasParamValue(param: string): boolean;
    deleteParamValue(param: string): void;
    setParamValue(param: string, value: any): void;
    dispose(): void;
    protected _rebuildResponseStack(params: SearchParameterMap): void;
    updateResult(result: SearchResult<T>): SearchResult<T>;
    reset(): Search<T>;
}
