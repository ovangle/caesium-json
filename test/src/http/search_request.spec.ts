import 'rxjs/add/observable/fromArray';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/reduce';

import {Observable} from 'rxjs/Observable';
import {RequestMethod} from 'angular2/http';

import {identityConverter} from 'caesium-core/converter';

import {StringMap} from '../../../src/json_codecs/interfaces';
import {JsonQuery, JsonResponse, JsonRequestOptions} from '../../../src/http/interfaces';
import {ModelHttp} from '../../../src/http/model_http';

import {SearchParameter} from '../../../src/http/search/parameter';
import {Search} from '../../../src/http/search_request';

import {parameterTests} from "./search/parameter.spec";
import {parameterMapTests} from "./search/parameter_map.spec";
import {searchResponseTests} from "./search/result.spec";

export function searchRequestTests() {

    describe('search_request', () => {
        searchTests();
        parameterTests();
        parameterMapTests();
        searchResponseTests();
    });

}

const MODEL_KIND = 'test::MyModel';
const SEARCH_ENDPOINT = 'search';
const SEARCH_PAGE_SIZE = 2;

function isSubstring(modelValue: string, paramValue: string) {
    return modelValue.includes(paramValue);
}

class MockModelHttp implements ModelHttp {
    http: any = null;
    apiHostHref:'http://host';

    _handleRequest:Function;

    constructor(requestHandler:(params:StringMap) => JsonQuery) {
        this._handleRequest = requestHandler;
    }

    request({method, kind, endpoint, params}: JsonRequestOptions):Observable<JsonResponse> {
        expect(method).toEqual(RequestMethod.Get);
        expect(kind).toEqual(MODEL_KIND);
        expect(endpoint).toEqual(SEARCH_ENDPOINT);
        return Observable.of({
            status: 200,
            body: this._handleRequest(params)
        });
    }
}


function _mkSearch(
    parameters: {[attr: string]: SearchParameter},
    requestHandler: (search: {[param: string]: string}) => JsonQuery
): Search<any> {
    var modelHttp = new MockModelHttp(requestHandler);
    var options = {
        parameters: parameters,
        endpoint: 'search',
        responseDecoder: identityConverter,
    };
    return new Search<any>(options, MODEL_KIND, SEARCH_PAGE_SIZE, modelHttp);
}

function _errHandler(params: StringMap): JsonQuery {
    throw 'Request handler should not be called';
}


export function searchTests() {
    describe('Search', () => {
        it('should be possible to get/set/delete a parameter value', () => {
            var search = _mkSearch({a: {encoder: identityConverter}}, _errHandler);
            expect(search.hasParamValue('a')).toBe(false, 'uninitialized parameter');
            expect(search.getParamValue('a')).toBeUndefined('no notSetValue');
            expect(search.getParamValue('a', 0)).toBe(0, 'should use notSetValue');

            search.setParamValue('a', 42);
            expect(search.hasParamValue('a')).toBe(true, 'value initialized');
            expect(search.getParamValue('a', 0)).toBe(42, 'parameter value set');

            search.deleteParamValue('a');
            expect(search.hasParamValue('a')).toBe(false, 'value deleted');
        });

        it('should be possible to submit an empty search to the server', (done) => {
            function requestHandler(search: StringMap): JsonQuery {
                expect(search['p']).toEqual('1', 'should add a pageId parameter to the search');
                return {pageId: 1, lastPage: true, items: [{a: '30'}]};
            }
            var search = _mkSearch({a: {encoder: identityConverter}}, requestHandler);

            return search.send().then((_) => {
                var response = search.response;
                expect(response.items.toArray()).toEqual([{a: '30'}]);
                done();
            });
        });

        it('should be able to perform a search on a set of data', (done) => {
            const allData = [
                {a: 'abcdef', b: 40},
                {a: 'abc', b: 30},
                {a: 'defghi', b: 30},
                {a: 'abcd', b: 20},
                {a: 'abcdef', b: 30}
            ];

            function requestHandler(search: StringMap): JsonQuery {
                var pageId = Number.parseInt(search['p']);
                var param_a = search['a'];
                var param_b = Number.parseInt(search['b']);

                var searchData = allData;

                if (typeof param_a !== "undefined") {
                    searchData = searchData.filter((item) => isSubstring(item.a, param_a));
                }

                if (!Number.isNaN(param_b)) {
                    searchData = searchData.filter((item) => item.b === param_b);
                }

                var fstIndex = 2 * (pageId - 1);

                var resultItems = searchData.slice(fstIndex, fstIndex + 2);
                return {
                    pageId: pageId,
                    lastPage: resultItems.length === 0,
                    items: resultItems
                };
            }

            var search = _mkSearch({
                a: {encoder: identityConverter, refiner: isSubstring, matcher: isSubstring},
                b: {encoder: identityConverter}
            }, requestHandler);

            return search.send().then((_) => {
                let items = [{a: 'abcdef', b: 40}, {a: 'abc', b: 30}];

                expect(search.response.items.toArray()).toEqual(
                    items,
                    "one page of '' results loaded"
                );
                search.setParamValue('a', 'abc');
                expect(search.response.items.toArray()).toEqual(
                    items,
                    "'a=abc' matches all results in first page of ''"
                );
                return search.send();
            }).then((_) => {
                expect(search.response.items.toArray()).toEqual([
                    {a: 'abcdef', b: 40},
                    {a: 'abc', b: 30},
                    {a: 'abcd', b: 20},
                    {a: 'abcdef', b: 30}
                ], "another page of 'a=abc' results loaded");
                search.setParamValue('a', 'abcdef');

                expect(search.response.items.toArray()).toEqual([
                    {a: 'abcdef', b: 40},
                    {a: 'abcdef', b: 30}
                ], "'a=abcdef' only matches two items");

                return search.send();
            }).then((_) => {
                expect(search.response.items.toArray()).toEqual([
                    {a: 'abcdef', b: 40},
                    {a: 'abcdef', b: 30}
                ]);

                var testLastPage = search.response.hasLastPage.then((lastPage) => {
                    expect(lastPage).toBe(true, "a=abcdef has no more items");
                });

                search.setParamValue('b', 30);
                expect(search.response.items.toArray()).toEqual([
                    {a: 'abcdef', b: 30}
                ]);

                search.setParamValue('a', 'abc');
                expect(search.response.items.toArray()).toEqual([
                    {a: 'abc', b: 30},
                    {a: 'abcdef', b: 30}
                ], "should still have results loaded for 'a=abc'");

                return Promise.all([testLastPage]).then((_) => {
                    done();
                })
            }).catch((err) => {
                fail(`Threw error: ${err}`);
                done();
            });
        });
    });
}
