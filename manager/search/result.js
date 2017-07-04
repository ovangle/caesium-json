"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/observable/from");
require("rxjs/add/observable/of");
require("rxjs/add/observable/throw");
require("rxjs/add/operator/reduce");
require("rxjs/add/operator/concatMap");
//TODO: remove
require("rxjs/add/operator/toPromise");
const immutable_1 = require("immutable");
const Observable_1 = require("rxjs/Observable");
const decorators_1 = require("caesium-core/decorators");
const result_page_1 = require("./result_page");
class SearchResult {
    constructor(search, parameters, pages) {
        this.search = search;
        this.parameters = parameters;
        this.pages = pages || immutable_1.List();
    }
    get items() {
        return this._getItems();
    }
    _getItems() {
        return this.pages
            .reduce((acc, page) => acc.concat(page.items), immutable_1.List())
            .toList();
    }
    /// The id of the next page.
    get nextPageId() {
        var currentPage = Math.floor(this.items.count() / this.search.pageSize);
        return currentPage + 1;
    }
    /// How many items of the next page need to be skipped?
    get skipNextPageItems() {
        return this.items.count() % this.search.pageSize;
    }
    get hasLastPage() {
        if (this.pages.isEmpty())
            return false;
        return this.pages.last().isLastPage;
    }
    _createPageRequest(pageId) {
        var request = this.search._requestFactory.get('');
        var requestParams = this.parameters.valuesToStringMap();
        requestParams[this.search.pageQueryParam] = pageId.toString();
        request.setRequestParameters(requestParams);
        return request;
    }
    _createSearchPageHandler() {
        return new result_page_1.SearchResultPageHandler(this.parameters, this.search.itemDecoder, this.skipNextPageItems);
    }
    loadNextPage() {
        if (this.hasLastPage) {
            return Observable_1.Observable.of(this);
        }
        var request = this._createPageRequest(this.nextPageId);
        var response = request.send();
        return response.handle(this._createSearchPageHandler())
            .map((page) => this._addPage(page));
    }
    /**
     * Load `n` pages in parallel
     * @param n
     */
    loadNextNPages(n) {
        var requests = immutable_1.Range(this.nextPageId, this.nextPageId + n)
            .map((pageId) => this._createPageRequest(pageId))
            .toArray();
        return Observable_1.Observable.from(requests)
            .concatMap((request) => {
            var response = request.send();
            return response.handle(this._createSearchPageHandler())
                .map((page) => {
                return page;
            });
        })
            .reduce((result, page) => result._addPage(page), this);
    }
    loadAllPages(maxParallelRequests = 5) {
        return this.loadNextNPages(maxParallelRequests)
            .concatMap((result) => {
            if (result.hasLastPage) {
                return Observable_1.Observable.of(result);
            }
            return result.loadAllPages();
        });
    }
    _addPage(page) {
        return this.search.updateResult(new SearchResult(this.search, this.parameters, this.pages.push(page)));
    }
    refine(refinedParams) {
        if (this.parameters.equals(refinedParams)) {
            // Nothing to do
            return this;
        }
        // Refine all the pages which were created at instantiation
        // of this result page
        var pages = this.pages
            .map((page) => result_page_1.refinePage(page, refinedParams))
            .toList();
        return new SearchResult(this.search, refinedParams, pages);
    }
}
__decorate([
    decorators_1.memoize(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], SearchResult.prototype, "_getItems", null);
exports.SearchResult = SearchResult;
//# sourceMappingURL=result.js.map