
import 'rxjs/add/observable/fromArray';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/reduce';

import {List} from 'immutable';

import {identityConverter} from 'caesium-core/converter';
import {SearchParameterMap} from '../../../../src/http/search/parameter_map';
import {SearchResponse, SearchResponsePage} from '../../../../src/http/search/search_response';
import {JsonResponse} from "../../../../src/http/interfaces";

export function searchResponseTests() {
    describe('search_response', () => {
        searchResponsePageTests();
        _searchResponseTests();
    });
}

const data = [
    {a: 'a'},
    {a: 'ab'},
    {a: 'abcdefghi'},
    {a: 'abc'},
    {a: 'abcd'},
    {a: 'abcdef'},
    {a: 'abcdefg'},
];

function isSubstring(modelValue: string, paramValue: string): boolean {
    return modelValue.includes(paramValue);
}

const PAGE_SIZE = 2;

function rawResponsePage(parameters: SearchParameterMap, pageId: number): JsonResponse {
    var firstIndex = 2 * (pageId - 1);
    var searchData: Array<{a: string}>;
    if (parameters.has('a')) {
        var param_a = parameters.get('a');
        searchData = data.filter((item) => isSubstring(item.a, param_a));
    } else {
        searchData = data;
    }

    return {
        status: 200,
        body: {
            pageId: pageId,
            lastPage: firstIndex >= searchData.length - 1,
            items: searchData.slice(firstIndex, firstIndex + 2)
        }
    };
}

function delayedRawResponsePage(parameters: SearchParameterMap, pageId: number, delay: number): Promise<JsonResponse> {
    return new Promise((resolve, reject) => {
        window.setTimeout(
            () => resolve(rawResponsePage(parameters, pageId)),
            delay
        );
    });
}

const paramMap = new SearchParameterMap({
    a: {encoder: identityConverter, matcher: isSubstring}
});

function searchResponsePageTests() {
    describe('SearchResponsePage', () => {
        it('should be possible to get the pages of a response page with an empty parameter map', () => {
            var page = new SearchResponsePage<any>(
                rawResponsePage(paramMap, 1),
                identityConverter,
                paramMap
            );
            expect(page.items.toArray()).toEqual([{a: 'a'}, {a: 'ab'}]);
            expect(page.itemCount()).toBe(2);
        });

        it('should filter the results based on the parameter map', () => {
            var page = new SearchResponsePage<any>(
                rawResponsePage(paramMap, 1),
                identityConverter,
                paramMap.set('a', 'ab')
            );
            expect(page.items.toArray()).toEqual([{a: 'ab'}]);
        });

        it('should skip the results based on the partial page', () => {
            var page = new SearchResponsePage<any>(
                rawResponsePage(paramMap, 1),
                identityConverter,
                paramMap
            );
            var pageWithSkip = page.skipItems(1);
            expect(pageWithSkip.items.toArray()).toEqual([{a: 'ab'}]);
        });

        it('should be possible to refine a response page', () => {
            var page = new SearchResponsePage<any>(
                rawResponsePage(paramMap, 1),
                identityConverter,
                paramMap
            );
            var refinement = page.refine(paramMap.set('a', 'ab'));

            expect(refinement.items.toArray()).toEqual([{a: 'ab'}]);
        });

        it('should not be possible to refine a response page with a parameter map that isn\'t a refinement', () => {
            var page = new SearchResponsePage<any>(
                rawResponsePage(paramMap, 1),
                identityConverter,
                paramMap.set('a', 'ab')
            );
            expect(() => page.refine(paramMap.set('a', 'a'))).toThrow();
        });

    });
}

function _searchResponseTests() {
    function mkPage<T>(paramMap: SearchParameterMap, pageId: number): SearchResponsePage<T> {
        return new SearchResponsePage<T>(
            rawResponsePage(paramMap, pageId),
            identityConverter,
            paramMap
        )
    }

    function mkPendingPage<T>(paramMap: SearchParameterMap, pageId: number, delay: number): Promise<SearchResponsePage<T>> {
        return delayedRawResponsePage(paramMap, pageId, delay).then((rawPage) => {
            return new SearchResponsePage<T>(
                rawPage,
                identityConverter,
                paramMap
            );
        });
    }
    describe('SearchResponse', () => {
        it('should create a search response with the given pages', () => {
            var pages = List([mkPage(paramMap, 1), mkPage(paramMap, 2)]);
            var response = new SearchResponse(paramMap, PAGE_SIZE, pages);
            expect(response.items.toArray())
                .toEqual([{a: 'a'}, {a: 'ab'}, {a: 'abcdefghi'}, {a: 'abc'}]);
        });

        it('should refine any pages provided to the constructor', () => {
            var pages = List([
                mkPage(paramMap, 1),
                mkPage(paramMap, 2),
            ]);
            var response = new SearchResponse(paramMap.set('a', 'ab'), PAGE_SIZE, pages);
            expect(response.items.toArray()).toEqual([{a: 'ab'}, {a: 'abcdefghi'}, {a: 'abc'}]);
        });

        it('should be possible to add a pending page to the response', (done) => {
            var pages = List([mkPage(paramMap, 1)]);
            var response = new SearchResponse(paramMap, PAGE_SIZE, pages);

            response.addPendingPage(mkPendingPage(paramMap, 2, 200));
            response.allPendingPagesLoaded.then((_) => {
                expect(response.items.toArray()).toEqual([{a: 'a'}, {a: 'ab'}, {a: 'abcdefghi'}, {a: 'abc'}]);
                done();
            });
        });

        it('should only load a partial page if there is not a multiple of pageSize items', (done) => {
            var pages = List([mkPage(paramMap, 1)]);

            var refinedParamMap = paramMap.set('a', 'ab');
            var response = new SearchResponse(refinedParamMap, PAGE_SIZE, pages);

            expect(response.items.count()).toBe(1);
            response.addPendingPage(mkPendingPage(refinedParamMap, 1, 200));

            response.allPendingPagesLoaded.then((_) => {
                expect(response.items.toArray())
                    .toEqual([{a: 'ab'}, {a: 'abcdefghi'}],
                            'should only have loaded a partial page of results');
                done();
            });
        });

        it('should add pending pages in order', (done) => {
            var response = new SearchResponse(paramMap, PAGE_SIZE, List<any>());

            /// Deliver the pages out of order.
            response.addPendingPage(mkPendingPage(paramMap, 1, 200));
            response.addPendingPage(mkPendingPage(paramMap, 2, 0));

            response.allPendingPagesLoaded.then((_) => {
                expect(response.items.toArray())
                    .toEqual([{a: 'a'}, {a: 'ab'}, {a: 'abcdefghi'}, {a: 'abc'}]);
                done();
            })

        });

        it('should be able to load a complete set of results', (done) => {
            var pages = List([
                mkPage(paramMap, 1),
                mkPage(paramMap, 2)
            ]);

            var refinedMap = paramMap.set('a', 'abcd');
            var response = new SearchResponse(refinedMap, PAGE_SIZE, pages);

            var test1 = response.nextPageId.then((pageId) => {
                // Should be a partial page of results.
                expect(pageId).toBe(1);
            });

            // Set the delay shorter than the constructor page to ensure that the page is loaded.
            // page 2 of the refined map should be a partial page.
            response.addPendingPage(mkPendingPage(refinedMap, 1, 0));
            response.addPendingPage(mkPendingPage(refinedMap, 2, 0));
            response.addPendingPage(mkPendingPage(refinedMap, 3, 0));
            var test2 = response.allPendingPagesLoaded.then((_) => {
                expect(response.items.toArray()).toEqual([
                    {a: 'abcdefghi'},
                    {a: 'abcd'},
                    {a: 'abcdef'},
                    {a: 'abcdefg'},
                ]);
                return response.hasLastPage.then((seen) => {
                    expect(seen).toBe(true, 'seen last page');
                });
            });

            Promise.all([test1, test2]).then((_) => done());
        });
    });
}

