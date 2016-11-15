
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/reduce';


import {identityConverter} from 'caesium-core/converter';
import {JsonObject} from '../../../src/json_codecs';
import {RequestFactory} from "../../../src/manager/http";

import {MockRequestFactory} from '../request_factory.mock';
import {MockSearch} from '../search.mock';

/*
function isSubstring(modelValue: string, paramValue: string): boolean {
    return modelValue.includes(paramValue);
}

const PAGE_SIZE = 2;

function loadData(path: string[], query: {[param: string]: string}, body: JsonObject): JsonObject {
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

    var pageId = Number.parseInt(query['p']);

    var param_a = query['a'] || '';
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

function errData(path: string[], query: {[param: string]: string}, body: any): JsonObject {
    throw 'Should not load a page';
}

function mkSearchResult(handler: RequestHandler) {
    var params = [
        {name: 'a', encoder: identityConverter, matcher: isSubstring}
    ];

    var request = new MockRequestFactory(handler);
    var search = new MockSearch(request, params);
    return search.result;
}

// Disabled while rebuilding request module.
xdescribe('manager.search.result', () => {
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

});
*/


