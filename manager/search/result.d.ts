import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/toPromise';
import { List } from 'immutable';
import { Observable } from 'rxjs/Observable';
import { Search } from '../search';
import { SearchParameterMap } from './parameter_map';
import { SearchResultPage } from "./result_page";
export declare class SearchResult<T> {
    search: Search<T>;
    parameters: SearchParameterMap;
    pages: List<SearchResultPage<T>>;
    constructor(search: Search<T>, parameters: SearchParameterMap, pages?: List<SearchResultPage<T>>);
    readonly items: List<T>;
    _getItems(): List<T>;
    readonly nextPageId: number;
    readonly skipNextPageItems: number;
    readonly hasLastPage: boolean;
    private _createPageRequest(pageId);
    private _createSearchPageHandler();
    loadNextPage(): Observable<SearchResult<T>>;
    /**
     * Load `n` pages in parallel
     * @param n
     */
    loadNextNPages(n: number): Observable<SearchResult<T>>;
    loadAllPages(maxParallelRequests?: number): Observable<SearchResult<T>>;
    private _addPage(page);
    refine(refinedParams: SearchParameterMap): SearchResult<T>;
}
