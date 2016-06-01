
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/reduce';


import {identityConverter} from 'caesium-core/converter';
import {RequestOptions, RawResponse} from "../../../../src/manager/model_http";

import {MockModelHttp} from '../model_http.mock';
import {MockSearch} from '../search.mock';

export function searchResultTests() {
    describe('result', () => {
        _searchResponseTests();
    });
}

function isSubstring(modelValue: string, paramValue: string): boolean {
    return modelValue.includes(paramValue);
}

const PAGE_SIZE = 2;

/**
 * The default request handler.
 * @param options
 * @returns RawResponse
 */
function loadData(options: RequestOptions): RawResponse {
    const data = [
        {a: 'a'},
        {a: 'abcd'},
        {a: 'abcdefghi'},
        {a: 'abc'},
        {a: 'ab'},
        {a: 'abcd'},
        {a: 'abcdef'},
        {a: 'abcdefg'},
    ];

    var pageId = Number.parseInt(options.params['p']);

    var param_a = options.params['a'] || '';
    var filtered = data.filter((item) => item.a.includes(param_a));

    return {
        status: 200,
        body: {
            items: filtered.slice((pageId - 1)* PAGE_SIZE, pageId * PAGE_SIZE),
            page_id: pageId,
            last_page: pageId * PAGE_SIZE >= filtered.length
        }
    };
}

function errData(options: RequestOptions): RawResponse {
    throw 'Should not load a page';
}



function mkSearchResult(handleRequest: (options: RequestOptions) => RawResponse) {
    var params = [
        {name: 'a', encoder: identityConverter, matcher: isSubstring}
    ];

    var http = new MockModelHttp(handleRequest);
    var search = new MockSearch(http, params);
    return search.result;
}

function _searchResponseTests() {
    describe('SearchResult', () => {
        it('the first result should be empty', () => {
            var result = mkSearchResult(errData);

            expect(result.items.toArray()).toEqual([]);
            expect(result.nextPageId).toBe(1);
            expect(result.hasLastPage).toBe(false);
        });

        it('should be possible to load a page of results', (done) => {
            var result = mkSearchResult(loadData);
            result.loadNextPage().toPromise().then((result) => {
                expect(result.items.toArray()).toEqual([{a: 'a'}, {a: 'abcd'}]);
                expect(result.nextPageId).toBe(2);
                expect(result.hasLastPage).toBe(false);
            }).catch((err) => fail(err))
                .then((_) => done());
        });

        it('should be possible to load many pages of results', (done) => {
            var result = mkSearchResult(loadData);
            result.loadNextNPages(2).toPromise()
                .then((result) => {
                    expect(result.items.toArray()).toEqual([{a: 'a'}, {a: 'abcd'}, {a: 'abcdefghi'}, {a: 'abc'}]);
                    expect(result.nextPageId).toEqual(3);
                    expect(result.hasLastPage).toBe(false);
                })
                .catch((err) => fail(err))
                .then((_) => done());

        });

        it('should be possible to load all pages of results', (done) => {
            var result = mkSearchResult(loadData);
            result.loadAllPages().toPromise()
                .then((result) => {
                    expect(result.items.toArray()).toEqual([
                        {a: 'a'}, {a: 'abcd'}, {a: 'abcdefghi'}, {a: 'abc'}, {a: 'ab'}, {a: 'abcd'}, 
                        {a: 'abcdef'}, {a: 'abcdefg'}
                    ]);
                    expect(result.nextPageId).toBe(5);
                    expect(result.hasLastPage).toBe(true);
                    done();
                })
                .catch((err) => fail(err))
                .then((_) => done());
        });

        it('should be possible to refine a result', (done) => {
            var result = mkSearchResult(loadData);
            result.loadNextNPages(2).toPromise().then((result) => {
                var refinedMap = result.parameters.set('a', 'abc')
                var refinedResult = result.refine(refinedMap);
                expect(refinedResult.items.toArray()).toEqual([
                    {a: 'abcd'}, {a: 'abcdefghi'}, {a: 'abc'}
                ]);

                expect(refinedResult.nextPageId).toBe(2);
                expect(refinedResult.skipNextPageItems).toBe(1);

                return refinedResult.loadNextPage().toPromise();
            }).then((result) => {
                
                expect(result.nextPageId).toBe(3);
                expect(result.skipNextPageItems).toBe(0);
                expect(result.items.toArray())
                    .toEqual([{a: 'abcd'}, {a: 'abcdefghi'}, {a: 'abc'},  {a: 'abcd'}]);
                
            }).catch((err) => fail(err)).then((_) => done());
        });
    });

}


