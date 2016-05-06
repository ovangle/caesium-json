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
import {SearchResponse} from '../../../src/http/search/search_response';
import {Search} from '../../../src/http/search_request';

import {parameterTests} from "./search/parameter.spec";
import {parameterMapTests} from "./search/parameter_map.spec";
import {resultTests} from "./search/result.spec";

export function searchRequestTests() {
    searchTests();

    describe('search', () => {
        parameterTests();
        parameterMapTests();
        resultTests();
    });

}

const MODEL_KIND = 'test::MyModel';
const SEARCH_ENDPOINT = 'search';
const SEARCH_PAGE_SIZE = 2;

class MockModelHttp implements ModelHttp {
    http = null;
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

function getAllItems(result: SearchResponse<any>) {
    return result.observeItems()
        .reduce<Immutable.Iterable<number,any>>((acc, items) => acc.concat(items))
        .map((acc) => acc.toArray())
        .toPromise();
}

export function searchTests() {

    describe('Search', () => {
        it('should be possible to submit an empty search to the server', (done) => {
            function requestHandler(search: StringMap): JsonQuery {
                expect(search['p']).toEqual('1');
                return {pageId: 1, lastPage: true, items: [{a: '30'}]};
            }
            var search = _mkSearch({a: {encoder: identityConverter}}, requestHandler);

            search.responseChange.first().toPromise().then((resultSet: SearchResponse<{a: number}>) => {
                resultSet.loadNextPage();
                return resultSet.observeItems().first().toPromise().then((items) => {
                    expect(items.toArray()).toEqual([{a: '30'}]);
                });
            }).then((_) => {
                search.dispose();
                done()
            }).catch((err) => {
                fail(err);
                done()
            });
        });

        it('changing a parameter variable should change the results', (done) => {
            function requestHandler(search: StringMap): JsonQuery {
                throw 'Setting a parameter should not trigger a request';
            }

            var search = _mkSearch({a: {encoder: identityConverter}}, requestHandler);

            search.responseChange.toArray().toPromise().then((results: SearchResponse<{a: number}>[]) => {
                expect(results.length).toEqual(2);
                expect((results[0] as any)._parameterMap.get('a')).toEqual(undefined);
                expect((results[1] as any)._parameterMap.get('a')).toEqual(40);
                done();
            }).catch(done);

            search.setParamValue('a', 40);
            search.dispose();
        });

        it('should be able to perform a search on a set of data', (done) => {
            const allData = [
                {a: 'abcdef', b: 40},
                {a: 'abc', b: 30},
                {a: 'defghi', b: 30},
                {a: 'abcd', b: 20},
                {a: 'abcdef', b: 30}
            ];

            function isSubstring(modelValue, paramValue) {
                return modelValue.includes(paramValue);
            }

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

                var resultItems = [searchData[fstIndex], searchData[fstIndex + 1]];
                return {
                    pageId: pageId,
                    lastPage: (fstIndex <= searchData.length - 1),
                    items: resultItems
                };
            }

            var search = _mkSearch({
                a: {encoder: identityConverter, refiner: isSubstring, matcher: isSubstring},
                b: {encoder: identityConverter}
            }, requestHandler);

            var tests = [];
            search.responseChange.subscribe((result: SearchResponse<any>) => {
                function getParamValue(param: string): any {
                    return (result as any)._parameterMap.get(param);
                }

                if (typeof getParamValue('a') === "undefined" && typeof getParamValue('b') === "undefined") {

                    result.loadNextPage();

                    // should have loaded the first page of results
                    tests.push(getAllItems(result).then((items) => {
                        expect(items).toEqual([
                            {a: 'abcdef', b: 40},
                            {a: 'abc', b: 30},
                        ]);
                        return 'test #1';
                    }).catch(done));
                }

                if (getParamValue('a') === 'abc' && typeof getParamValue('b') === "undefined") {
                    // Load another page of results, so that we have a value for b == 30
                    // which wasn't present in the original results (see: test #5)
                    result.loadNextPage();

                    tests.push(getAllItems(result).then((items) => {
                        expect(items).toEqual([
                            {a: 'abcdef', b: 40},
                            {a: 'abc', b: 30},
                            {a: 'abcd', b: 20},
                            {a: 'abcdef', b: 30}
                        ]);
                        return 'test #2';
                    }).catch(done));
                }

                if (getParamValue('a') === 'abcdef' && typeof getParamValue('b') === "undefined") {
                    tests.push(getAllItems(result).then((items) => {
                        expect(items).toEqual([
                            {a: 'abcdef', b: 40},
                            {a: 'abcdef', b: 30}
                        ]);
                        return 'test #3';
                    }).catch(done));

                }

                if (getParamValue('a') === 'abcdef' && getParamValue('b') === 30) {
                    tests.push(getAllItems(result).then((items) => {
                        expect(items).toEqual([
                            {a: 'abcdef', b: 30}
                        ]);
                        return 'test #4';
                    }).catch(done));
                }

                if (getParamValue('a') === 'abc' && getParamValue('b') === 30) {
                    // Test #5. Should have loaded results from a=abc
                    tests.push(getAllItems(result).then((items) => {
                        expect(items).toEqual([
                            {a: 'abc', b: 30},
                            {a: 'abcdef', b: 30},
                        ]);
                        return 'test #5';
                    }).catch(done));
                }

                result.dispose();
            });

            search.setParamValue('a', 'abc');
            search.setParamValue('a', 'abcdef');
            search.setParamValue('b', 30);
            search.setParamValue('a', 'abc');

            Promise.all(tests).then((ranTests: Array<string>) => {
                for (let testID of ['test #1', 'test #2', 'test #3', 'test #4', 'test #5']) {
                    expect(ranTests.find((item) => item === testID)).toBeTruthy(`ran ${testID}`);
                }
                done();
            });
        });
    });
}
