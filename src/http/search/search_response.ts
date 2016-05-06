import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import {SearchParameterMap} from './parameter_map';
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import {Subscription} from "rxjs/Subscription";
import {AbstractResponse, ResponsePage} from "../interfaces";

export type PageLoader<T> = (parameters: SearchParameterMap, pageId: number) => Promise<ResponsePage<T>>;

/// @Mutable
export class SearchResponse<T> implements AbstractResponse {
    /// The http status of the request which loaded the last page of results
    status: number;

    /// A cache of all the items which have been fetched for this result list.
    private _items: Immutable.List<T>;

    /// The parameter map which was used to generate this result list.
    private _parameterMap: SearchParameterMap;

    private _pendingPage: Promise<void>;

    private _seenLastPage: boolean = false;

    private _subscribers: Immutable.List<Subscriber<Immutable.Iterable<number,T>>>;

    /// The number of items which are loaded per page of results.
    public pageSize: number;

    /// A function which obtains a new page of results from the server.
    /// The returned observable is a single use observable and can be discarded after
    /// completion.
    private _loadNextPage: PageLoader<T>;

    constructor(
        parameterMap: SearchParameterMap,
        pageSize: number,
        loadNextPage: PageLoader<T>
    ) {
        this._items = Immutable.List<T>();
        this._parameterMap = parameterMap;
        this.pageSize = pageSize;
        this._loadNextPage = loadNextPage;
        this._subscribers = Immutable.List<Subscriber<Immutable.Iterable<number,T>>>();

        this._seenLastPage = false;
        this._pendingPage = Promise.resolve();
    }

    /// The parameters which generated this result.
    get parameters(): SearchParameterMap {
        return this._parameterMap;
    }

    /// All the items which have been loaded into the result so far. If there are any pending pages,
    /// they will not be included in this list.
    get items(): Immutable.List<T> {
        return this._items;
    }

    get seenLastPage(): boolean {
        return this._seenLastPage;
    }

    /// A stream of items from this result list.
    // Each time a new page of results is loaded, the items will be emitted on this stream.
    observeItems(): Observable<Immutable.Iterable<number,T>> {
        return Observable.create((subscriber) => {
            this._subscribers = this._subscribers.push(subscriber);
        });
    }

    loadNextPage(): Promise<void> {
        if (this._seenLastPage) {
            return this._pendingPage;
        }
        this._pendingPage = this._pendingPage.then((_) => {
            var currentPage = Math.floor(this._items.count() / this.pageSize);
            return this._loadNextPage(this._parameterMap, currentPage + 1)
                .then((page) => this._handlePageResults(page));
        });
        return this._pendingPage;
    }

    private _handlePageResults(page: ResponsePage<T>): void {
        // There could be a partial page. Skip the appropriate number of items.
        var skipItems = this._items.count() % this.pageSize;
        var newItems = page.body.skip(skipItems);

        if (page.lastPage) {
            this._seenLastPage = true;
        }

        this.status = page.status;
        this._emit(newItems);
        this._items = this._items.concat(newItems).toList();
    }

    private _emit(items: Immutable.Iterable<number,T>): void {
        this._subscribers
            .filter((subscriber) => !subscriber.isUnsubscribed)
            .forEach((subscriber) => subscriber.next(items));
    }

    /// @Internal
    /// Add any results from the parent to this result list.
    _contributeResults(parent: SearchResponse<T>): Promise<void> {
        this._pendingPage = parent._pendingPage.then((_) => {
            var contributions = parent._items.filter((item) => this._parameterMap.matches(item));

            if (contributions.count() > this._items.count()) {
                this._emit(contributions.skip(this._items.count()));
                this._items = contributions.toList();
            }
        });
        return this._pendingPage;
    }

    dispose(): void {
        this._pendingPage.then((_) => {
            this._subscribers
                .filter((subscriber) => !subscriber.isUnsubscribed)
                .forEach((subscriber) => subscriber.complete());
            this._subscribers = this._subscribers.clear();
        });
    }

    toString(): string {
        return `SearchResults(for: ${this.parameters})`
    }
}
