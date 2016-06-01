import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/concatMap';

//TODO: remove
import 'rxjs/add/operator/toPromise';

import {Seq, Iterable, List, Range} from 'immutable';
import {Observable} from 'rxjs/Observable';

import {memoize} from 'caesium-core/decorators';

import {Search} from '../search';
import {Response} from '../request/interfaces';
import {Get} from '../request/get';
import {SearchParameterMap} from './parameter_map';
import {SearchResultPage, refinePage, SearchResultPageHandler} from "./result_page";
import {StateException} from "../../exceptions";

export class SearchResult<T> {

    search:Search<T>;
    parameters:SearchParameterMap;
    pages:List<SearchResultPage<T>>;


    constructor(search:Search<T>,
                parameters:SearchParameterMap,
                pages?:List<SearchResultPage<T>>) {
        this.search = search;
        this.parameters = parameters;
        this.pages = pages || List<SearchResultPage<T>>();

    }


    get items() {
        return this._getItems();
    }

    @memoize()
    _getItems():List<T> {
        return this.pages
            .reduce<Iterable<number,T>>((acc, page) => acc.concat(page.items), List<T>())
            .toList();
    }

    /// The id of the next page.
    get nextPageId():number {
        var currentPage = Math.floor(this.items.count() / this.search.pageSize);
        return currentPage + 1;
    }

    /// How many items of the next page need to be skipped?
    get skipNextPageItems():number {
        return this.items.count() % this.search.pageSize;
    }

    get hasLastPage():boolean {
        if (this.pages.isEmpty())
            return false;
        return this.pages.last().isLastPage;
    }

    private _createPageRequest(pageId:number):Get {
        var request = this.search._requestFactory.get('');
        var requestParams = this.parameters.valuesToStringMap();
        requestParams['p'] = pageId.toString();

        request.setRequestParameters(requestParams);
        return request;
    }

    private _createSearchPageHandler():SearchResultPageHandler<T> {
        return new SearchResultPageHandler<T>(
            this.parameters,
            this.search.itemDecoder,
            this.skipNextPageItems
        );
    }

    loadNextPage():Observable<SearchResult<T>> {
        if (this.hasLastPage) {
            return Observable.of(this);
        }

        var request = this._createPageRequest(this.nextPageId);
        var response = request.send();
        return response.handle<SearchResultPage<T>>(this._createSearchPageHandler())
            .map((page) => this._addPage(page));
    }

    /**
     * Load `n` pages in parallel
     * @param n
     */
    loadNextNPages(n:number):Observable<SearchResult<T>> {
        var requests = Range(this.nextPageId, this.nextPageId + n)
            .map((pageId) => this._createPageRequest(pageId))
            .toArray();

        return Observable.from(requests)
            .concatMap((request) => {
                var response = request.send();
                return response.handle(this._createSearchPageHandler())
                    .map((page:SearchResultPage<T>) => {
                        return page;
                    })
            })
            .reduce((result:SearchResult<T>, page:SearchResultPage<T>) => result._addPage(page), this)
    }

    loadAllPages(maxParallelRequests:number = 5):Observable<SearchResult<T>> {
        return this.loadNextNPages(maxParallelRequests)
            .concatMap((result) => {
                if (result.hasLastPage) {
                    return Observable.of(result);
                }
                return result.loadAllPages();
            });
    }

    private _addPage(page:SearchResultPage<T>):SearchResult<T> {
        return this.search.updateResult(new SearchResult<T>(
            this.search,
            this.parameters,
            this.pages.push(page)
        ));
    }

    refine(refinedParams:SearchParameterMap):SearchResult<T> {
        // Refine all the pages which were created at instantiation
        // of this result page
        var pages = this.pages
            .map((page) => refinePage(page, refinedParams))
            .toList();

        return new SearchResult(this.search, refinedParams, pages);
    }
}

