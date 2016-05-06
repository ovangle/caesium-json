
import 'rxjs/add/observable/fromArray';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/reduce';
import {Observable} from 'rxjs/Observable';

import {identityConverter} from 'caesium-core/converter';
import {SearchParameterMap} from '../../../../src/http/search/parameter_map';
import {ResponsePage} from '../../../../src/http/interfaces';
import {SearchResponse} from '../../../../src/http/search/search_response';

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

function loadNextPage(parameters: SearchParameterMap, pageId: number): Promise<ResponsePage<any>> {
    var firstIndex = 2 * (pageId - 1);
    var pageData = Immutable.List([
        data[firstIndex],
        data[firstIndex + 1]
    ]);

    return Promise.resolve({
        status: 200,
        pageId: pageId,
        lastPage: firstIndex >= pageData.count() + 1,
        body: pageData
    });
}

function loadNextPageRestricted(parameters: SearchParameterMap, pageId: number): Promise<ResponsePage<any>> {
    var restrictedData = data.filter((value) => value.a.includes('abcd'));
    var firstIndex= 2 * (pageId - 1);
    var pageData = Immutable.List([
        restrictedData[firstIndex],
        restrictedData[firstIndex + 1]
    ]);

    return Promise.resolve({
        status: 200, 
        pageId: pageId, 
        lastPage: firstIndex >= pageData.count() + 1, 
        body: pageData
    });
}

function getAllItems(observable: Observable<Immutable.Iterable<number,any>>): Promise<Array<any>> {
    return observable
        .reduce<Immutable.Iterable<number,any>>((acc, value) => acc.concat(value), Immutable.List())
        .map((acc) => acc.toArray())
        .toPromise();
}

const paramMap = new SearchParameterMap({
    a: {encoder: identityConverter, matcher: isSubstring, refiner: isSubstring}
});

export function resultTests() {
    describe('SearchResult', () => {

        it('should be possible to a single page of results', (done) => {
            var results = new SearchResponse(paramMap, PAGE_SIZE, loadNextPage);

            getAllItems(results.observeItems()).then((items: any[]) => {
                expect(items).toEqual([
                    {a: 'a'},
                    {a: 'ab'}
                ]);
                done();
            });

            results.loadNextPage();

            results.dispose();
        });

        it('should be possible to load multiple pages of results', (done) => {
            var results = new SearchResponse(paramMap, PAGE_SIZE, loadNextPage);

            getAllItems(results.observeItems()).then((items: any[]) => {
                expect(items).toEqual([
                    {a: 'a'},
                    {a: 'ab'},
                    {a: 'abcdefghi'},
                    {a: 'abc'},
                ]);
                done();
            });

            results.loadNextPage();
            results.loadNextPage();

            results.dispose();
        });

        it('should be able to contribute the results of its ancestors', (done) => {
            var parentResults = new SearchResponse(paramMap, PAGE_SIZE, loadNextPage);
            parentResults.loadNextPage();
            parentResults.loadNextPage();
            parentResults.loadNextPage();

            var restrictedParams = paramMap.set('a', 'abcd');

            var results = new SearchResponse(restrictedParams, PAGE_SIZE, loadNextPageRestricted);
            results._contributeResults(parentResults);

            getAllItems(results.observeItems()).then((items: any[]) => {
                expect(items).toEqual([
                    {a: 'abcdefghi'},
                    {a: 'abcd'},
                    {a: 'abcdef'},
                ]);
                done();
            });

            parentResults.dispose();
            results.dispose();
        });

        it('should be possible to load a partial page', (done) => {
            // The only way to load a partial page through the "public" api is to
            // load 3 results from the parent and then load a page.
            var parentResults = new SearchResponse(paramMap, PAGE_SIZE, loadNextPage);
            parentResults.loadNextPage();
            parentResults.loadNextPage();
            parentResults.loadNextPage();

            var restrictedParams = paramMap.set('a', 'abcd');

            var results = new SearchResponse(restrictedParams, PAGE_SIZE, loadNextPageRestricted);
            results._contributeResults(parentResults);
            // This is the partial page.
            results.loadNextPage();

            getAllItems(results.observeItems()).then((items: any[]) => {
                expect(items).toEqual([
                    {a: 'abcdefghi'},
                    {a: 'abcd'},
                    {a: 'abcdef'},
                    {a: 'abcdefg'}
                ]);
                done();
            });

            parentResults.dispose();
            results.dispose();
        });


    });
}

