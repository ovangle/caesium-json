import {List} from 'immutable';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {OpaqueToken} from '@angular/core';

import {Converter} from 'caesium-core/converter';
import {Codec, isCodec, getDecoder} from 'caesium-core/codec';

import {JsonObject} from '../../json_codecs';

import {RequestFactory} from '../http';
import {SearchParameterMap} from './parameter_map';
import {SearchParameter} from './parameter';
import {SearchResultPage} from './result_page';
import {SearchResult} from './result';

export const SEARCH_PAGE_SIZE = new OpaqueToken('cs_search_page_size');
export const defaultSearchPageSize = 20;
/**
 * The query parameter to set when requesting a particular
 * page of results.
 */
export const SEARCH_PAGE_QUERY_PARAM = new OpaqueToken('cs_search_page_query_param');
export const defaultSearchPageQueryParam = 'p';

export interface SearchOptions {
    request: RequestFactory;
    kind: string;
    parameters: {[name: string]: SearchParameterMap};
}

export class Search<T> {

    pageSize: number;
    pageQueryParam: string;
    itemDecoder: Converter<JsonObject,T>;

    _requestFactory: RequestFactory;
    protected _resultStack: List<SearchResult<T>>;

    protected _resultChange: Subject<SearchResult<T>>;
    protected _onReset: Subject<void>;

    private _parameterDefns: SearchParameter[];

    constructor(
        requestFactory: RequestFactory,
        public path: string[],
        parameters: SearchParameter[],
        itemDecoder: Codec<T,JsonObject> | Converter<JsonObject,T>,
        pageSize: number,
        pageQueryParam: string
    ) {
        this._requestFactory = requestFactory;
        this.pageSize = pageSize;
        this.pageQueryParam = pageQueryParam;

        if (isCodec(itemDecoder)) {
            this.itemDecoder = getDecoder(itemDecoder as Codec<T,JsonObject>);
        } else {
            this.itemDecoder = itemDecoder as Converter<JsonObject,T>;
        }

        this._resultChange = new Subject<SearchResult<T>>();
        this._onReset = new Subject<void>();
        this._parameterDefns = parameters;

        var initialParams = new SearchParameterMap(this._parameterDefns);
        this._resultStack = List<SearchResult<T>>([
            new SearchResult(this, initialParams)
        ]);
        this._onReset.next(null);
    }

    /// The active result
    get result(): SearchResult<T> {
        return this._resultStack.last();
    }

    get resultChange(): Observable<SearchResult<T>> { return this._resultChange; }
    get onReset(): Observable<any> { return this._onReset; }

    getParamValue(param: string, notSetValue?: any): any {
        return this.result.parameters.get(param, notSetValue);
    }

    hasParamValue(param: string): boolean {
        return this.result.parameters.has(param);
    }

    deleteParamValue(param: string): void {
        var params = this.result.parameters.delete(param);
        this._rebuildResponseStack(params);
    }

    setParamValue(param: string, value: any): void {
        var params = this.result.parameters.set(param, value);
        this._rebuildResponseStack(params);
    }

    dispose() {
        this._resultChange.complete();
        this._onReset.complete();
    }

    protected _rebuildResponseStack(params: SearchParameterMap) {
        // If the user reverts to a previous parameter state, (say, by deleting some of the input)
        // then we roll back the stack until we find a cached result set that still matches the
        // new input.
        // It is very unlikely that a user will erase some input just to add it back again,
        // but it's not practical to keep the cache around indefinitely
        var keepResponses = this._resultStack
            .takeWhile((result) => params.isRefinementOf(result.parameters))
            .toList();

        if (!keepResponses.last().parameters.equals(params)) {
            var newResponse = keepResponses.last().refine(params);
            keepResponses = keepResponses.push(newResponse);
        }
        this._resultStack = keepResponses;
        this._resultChange.next(keepResponses.last());
    }

    updateResult(result: SearchResult<T>): SearchResult<T> {
        var resultIndex = this._resultStack.findLastIndex((r) => r.parameters.equals(result.parameters));
        if (resultIndex < 0) {
            // The result has been discarded. Don't update the stack.
            return result;
        } else if (resultIndex === this._resultStack.count() - 1) {
            if (!this._resultChange.closed) {
                this._resultChange.next(result);
            }
        }
        this._resultStack = this._resultStack.set(resultIndex, result);
        return result;
    }

    reset(): Search<T> {
        return new Search<T>(
            this._requestFactory,
            this.path,
            this._parameterDefns,
            this.itemDecoder,
            this.pageSize,
            this.pageQueryParam
        );
    }

}
