import {List, Iterable} from 'immutable';

import {Converter} from 'caesium-core/converter';
import {memoize} from 'caesium-core/decorators';

import {ArgumentError} from '../../exceptions';
import {AbstractResponse, JsonResponse, JsonObject, JsonQuery, isJsonQuery} from '../interfaces';

import {SearchParameterMap} from './parameter_map';

export class SearchResponsePage<T> implements AbstractResponse {
    /** The parameter map which was used to generate this response page */
    parameters: SearchParameterMap;

    private _decoder: Converter<JsonObject,T>;

    private _rawResponse: JsonResponse;

    /**
     * If there was a partial page of results loaded from the search
     * results that were being refined, then when loading a new page,
     * there will be duplicates at the head of the list.
     *
     * The number of items to skip.
     */
    private _skip = 0;

    /** The HTTP status of this page of results. */
    get status(): number { return this._rawResponse.status; }

    get items(): List<T> { return this._getItems(); }

    get _query(): JsonQuery { return this._rawResponse.body as JsonQuery }

    /** The items present on this page of results. */
    @memoize()
    private _getItems(): List<T> {
        return List<JsonObject>(this._query.items)
            .skip(this._skip)
            .map((item) => this._decoder(item))
            .filter((item) => this.parameters.matches(item))
            .toList();
    }

    /** Is this the last page of results? */
    get isLastPage(): boolean { return this._query.lastPage; }

    @memoize()
    itemCount(): number {
        return this.items.count();
    }

    constructor(
        jsonResponse:JsonResponse,
        responseDecoder:Converter<JsonObject,T>,
        parameters: SearchParameterMap,
        skipItems: number = 0
    ) {
        if (!isJsonQuery(jsonResponse.body))
            throw new ArgumentError(`Not a JsonQuery: ${jsonResponse}`);
        this._rawResponse = jsonResponse;
        this._decoder = responseDecoder;
        this.parameters = parameters;
        this._skip = skipItems;
    }

    skipItems(count: number): SearchResponsePage<T> {
        return new SearchResponsePage<T>(
            this._rawResponse,
            this._decoder,
            this.parameters,
            count
        );
    }

    refine(paramMap: SearchParameterMap): SearchResponsePage<T> {
        if (!paramMap.isRefinementOf(this.parameters)) {
            throw new ArgumentError('parameters must be a refinement');
        }
        return new SearchResponsePage<T>(
            this._rawResponse,
            this._decoder,
            paramMap
        );
    }
}

export class SearchResponse<T> {

    parameters:SearchParameterMap;

    _pages:List<SearchResponsePage<T>>;

    pageSize:number;

    /// All pages which have been requested from the server but not yet
    /// added to the search result.
    private _pendingPage:Promise<SearchResponsePage<T>>;

    constructor(paramMap:SearchParameterMap,
                pageSize:number,
                pages?: List<SearchResponsePage<T>>) {
        this.parameters = paramMap;
        if (!pages)
            pages = List<SearchResponsePage<T>>();
        this._pages = pages.map(page => page.refine(paramMap)).toList();
        this.pageSize = pageSize;
    }

    /// Get the pages loaded on the response.
    /// Does not include pending pages.
    get pages(): List<SearchResponsePage<T>> {
        return this._pages;
    }

    /// Get the items loaded on the response.
    /// Does not include items from pending pages.
    get items(): List<T> {
        return this.pages.reduce<Iterable<number,T>>(
            (acc, page) => acc.concat(page.items),
            List<T>()
        ).toList();
    }

    get allPendingPagesLoaded(): Promise<void> {
        var wait: Promise<any> = this._pendingPage || Promise.resolve();
        return wait.then((_) => null);
    }

    get nextPageId(): Promise<number> {
        var wait: Promise<any> = this._pendingPage || Promise.resolve();
        return wait.then((_) => {
            var currentPage = Math.floor(this.items.count() / this.pageSize);
            return currentPage + 1;
        });
    }

    get hasLastPage(): Promise<boolean> {
        var wait: Promise<any> = this._pendingPage || Promise.resolve();
        return wait.then((_) => {
            // If we haven't loaded a single page, then we still need to check the
            // server for an empty page of items.
            if (this.pages.isEmpty())
                return false;
            return this.pages.last().isLastPage;
        });
    }

    private _loadPageIntoResponse(page: SearchResponsePage<T>, skipPartial: boolean): SearchResponsePage<T> {
        console.log(JSON.stringify(page.items.toArray()));
        if (page.parameters !== this.parameters) {
            throw new ArgumentError('Page parameters not from this response');
        }
        // There could be a partial page of results
        var skipItems = this.items.count() % this.pageSize;
        if (skipPartial && skipItems > 0) {
            page = page.skipItems(skipItems);
        }
        this._pages = this._pages.push(page);
        return page;
    }

    /// Waits for the page to load from the server,
    /// adds it to the results, then returns the HTTP status of the page.
    addPendingPage(pendingPage: Promise<SearchResponsePage<T>>): Promise<number>{
        var wait: Promise<any> = this._pendingPage || Promise.resolve();
        this._pendingPage = wait
            .then((_) => pendingPage)
            .then(page => this._loadPageIntoResponse(page, true));

        return this._pendingPage.then((page) => page.status);
    }

}
