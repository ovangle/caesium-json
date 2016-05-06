import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {Subscriber} from 'rxjs/Subscriber';
import {RequestMethod} from 'angular2/http';
import {isBlank} from 'caesium-core/lang';

import {AbstractResponse, AccessorRequestOptions, JsonQuery, ResponsePage} from "./interfaces";
import {ModelHttp} from './model_http';
import {AccessorRequest} from "./abstract_request";

import {SearchParameter} from './search/parameter';
import {SearchParameterMap} from './search/parameter_map';
import {SearchResponse} from "./search/search_response";

export {SearchParameter, SearchResponse};

export interface SearchOptions<TResponse> extends AccessorRequestOptions<TResponse> {
    parameters: {[name: string]: SearchParameter};
    pageSize?: number;
}

interface ParameterSearchResult<T> {
    params: SearchParameterMap;
    result: SearchResponse<T>;
}

export class Search<TResponse> extends AccessorRequest<void, TResponse> {
    parameters: SearchParameterMap;
    pageSize: number;

    private resultStack: Immutable.Stack<ParameterSearchResult<TResponse>>;

    constructor(options: SearchOptions<TResponse>, kind: string, pageSize: number, http: ModelHttp) {
        super(options, kind, http);
        this.parameters = new SearchParameterMap(options.parameters);
        this.pageSize = pageSize;

        var firstResult = new SearchResponse<TResponse>(this.parameters, this.pageSize, (parameters, pageId) => {
            return this._submitRequest(parameters, pageId);
        });

        this.resultStack = Immutable.Stack<ParameterSearchResult<TResponse>>()
            .unshift({params: this.parameters, result: firstResult});
    }

    private _submitRequest(parameters: SearchParameterMap, pageId: number): Promise<ResponsePage<TResponse>> {
        var search = parameters.valuesToStringMap();
        if (!isBlank(pageId)) {
            search['p'] = `${pageId}`;
        }

        return this.http.request({
            method: RequestMethod.Get,
            kind: this.kind,
            endpoint: this.endpoint,
            params: search
        }).map((response) => {
            var querySet = response.body as JsonQuery;
            var decodedItems = Immutable.List(querySet.items.map((item) => this.responseDecoder(item)));
            return {
                status: response.status,
                body: decodedItems,
                pageId: querySet.pageId,
                lastPage: querySet.lastPage
            };
        }).toPromise();
    }

    getParamValue(param: string): any {
        return this.parameters.get(param);
    }

    setParamValue(param: string, value: any) {
        this.parameters = this.parameters.set(param, value);
        var result = new SearchResponse<TResponse>(
            this.parameters,
            this.pageSize,
            (parameters, pageId) => this._submitRequest(parameters, pageId)
        );

        // If the user reverts to a previous parameter state, (say, by deleting some of the input)
        // then we roll back the stack until we find a cached result set that still matches the
        // new input.
        // It is very unlikely that a user will erase some input just to add it back again,
        // but it's not practical to keep the cache around indefinitely
        var discardResults = this.resultStack.takeWhile((item) => !item.params.isRefinementOf(this.parameters));
        var keepResults = this.resultStack.skip(discardResults.count()).toStack();

        // There is no need to check if the result stack is empty.
        // The first item is an empty parameter map which refines every other map.
        result._contributeResults(keepResults.first().result);
        this.resultStack = keepResults.unshift({params: this.parameters, result: result});

        this.emit(result);
        discardResults.forEach((item) => item.result.dispose());
    }

    protected onResultChangeSubscription(subscriber: Subscriber<AbstractResponse>) {
        super.onResultChangeSubscription(subscriber);
        // The subscriber should always have the current first result.
        subscriber.next(this.resultStack.first().result);
    }

    dispose() {
        super.dispose();
        this.resultStack.forEach((item) => item.result.dispose());
    }
}
