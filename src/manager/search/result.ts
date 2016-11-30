import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';

import 'rxjs/add/operator/do';

import {Seq, Iterable, List, Range} from 'immutable';
import {Observable} from 'rxjs/Observable';

import {Converter} from 'caesium-core/converter';
import {memoize} from 'caesium-core/decorators';

import {JsonObject} from '../../json_codecs/index';

import {Search} from './search';
import {Request, RequestFactory} from '../http/index';
import {SearchParameterMap} from './parameter_map';
import {SearchResultPage, refinePage, searchResultPageHandler} from "./result_page";

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

    private _createPageRequest(pageId:number):Request {
        var params = this.parameters.valuesToStringMap();
        params[this.search.pageQueryParam] = pageId.toString();

        return this.search._requestFactory.get(this.search.path, params);
    }

    private _createSearchPageHandler() {
        return searchResultPageHandler<T>(
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
        return request.send(this._createSearchPageHandler())
            .map(page => this._addPage(page));
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
                return request.send(this._createSearchPageHandler())
                    .map(model=> {
                        console.log('Received', model);
                        return model;
                    })
            })
            .reduce((result:SearchResult<T>, page:SearchResultPage<T>) => result._addPage(page), this);
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
        if (this.parameters.equals(refinedParams)) {
            // Nothing to do
            return this;
        }


        // Refine all the pages which were created at instantiation
        // of this result page
        var pages = this.pages
            .map((page: SearchResultPage<T>) => refinePage(page, refinedParams))
            .toList();

        return new SearchResult(this.search, refinedParams, pages);
    }
}

