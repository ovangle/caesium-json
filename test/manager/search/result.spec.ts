
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/reduce';

import {async} from '@angular/core/testing';

import {identityConverter} from 'caesium-core/converter';
import {JsonObject} from '../../../src/json_codecs';
import {RequestFactory, Request} from "../../../src/manager/http";

import {MockRequestFactory, MockRequest} from '../request_factory.mock';
import {MockSearch} from './search.mock';


function isSubstring(modelValue: string, paramValue: string): boolean {
    return modelValue.includes(paramValue);
}

const PAGE_SIZE = 2;

function loadData(request: MockRequest): void {
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

    var pageId = Number.parseInt(request.query['p']);

    var param_a = request.query['a'] || '';
    var filtered = data.filter((item) => item.a.includes(param_a));


   request.respond({
        status: 200,
        body: {
            items: filtered.slice((pageId - 1)* PAGE_SIZE, pageId * PAGE_SIZE),
            page_id: pageId,
            last_page: pageId * PAGE_SIZE >= filtered.length
        }
    });
}

const PARAMS = [{name: 'a', encoder: identityConverter, matcher: isSubstring}];


describe('manager.search.result', () => {
    describe('SearchResult', () => {

        it('the first result should be empty', () => {
            let factory = new MockRequestFactory();
            factory.sent$.forEach(factory => {
                fail('Should not send a request');
            });

            let result = new MockSearch(factory, PARAMS).result;

            expect(result.items.toArray()).toEqual([]);
            expect(result.nextPageId).toBe(1);
            expect(result.hasLastPage).toBe(false);

            factory.dispose();
        });

        it('should be possible to load a page of results', async(() => {
            let factory = new MockRequestFactory();
            factory.sent$.forEach(loadData);

            let result = new MockSearch(factory, PARAMS).result;

            result.loadNextPage().forEach((result) => {
                expect(result.items.toArray()).toEqual([{a: 'a'}, {a: 'abcd'}]);
                expect(result.nextPageId).toBe(2);
                expect(result.hasLastPage).toBe(false);
            })
                .catch(fail)
                .then(_ => {
                    factory.dispose();
                });
        }));

        it('should be possible to load many pages of results', async(() => {
            let factory = new MockRequestFactory();
            factory.sent$.forEach(loadData);
            let result = new MockSearch(factory, PARAMS).result;

            result.loadNextNPages(2).toPromise()
                .then((result) => {
                    expect(result.items.toArray()).toEqual([{a: 'a'}, {a: 'abcd'}, {a: 'abcdefghi'}, {a: 'abc'}]);
                    expect(result.nextPageId).toEqual(3);
                    expect(result.hasLastPage).toBe(false);
                })
                .catch(fail)
                .then(_ => factory.dispose());
        }));

        it('should be possible to load all pages of results', async(() => {
            let factory = new MockRequestFactory();
            factory.sent$.forEach(loadData);

            let result = new MockSearch(factory, PARAMS).result;

            result.loadAllPages().forEach(result => {
                expect(result.items.toArray()).toEqual([
                    {a: 'a'}, {a: 'abcd'}, {a: 'abcdefghi'}, {a: 'abc'}, {a: 'ab'}, {a: 'abcd'},
                    {a: 'abcdef'}, {a: 'abcdefg'}
                ]);
                expect(result.nextPageId).toBe(5);
                expect(result.hasLastPage).toBe(true);
            })
                .catch(fail)
                .then(_ => factory.dispose());
        }));

        it('should be possible to refine a result', async(() => {
            let factory = new MockRequestFactory();
            factory.sent$.forEach(loadData);

            let result = new MockSearch(factory, PARAMS).result;

            result.loadNextNPages(2)
                .toPromise()
                .then((result) => {
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

                })
                .catch(fail)
                .then((_) => factory.dispose());
        }));
    });

});



