import 'rxjs/add/observable/fromArray';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/reduce';


import {identityConverter} from 'caesium-core/converter';

import {ModelMetadata} from '../../../src/model/metadata';
import {RawResponse, RequestOptions} from '../../../src/manager/model_http';
import {RequestFactory} from "../../../src/manager/request/factory";
import {Search, SearchParameter} from '../../../src/manager/search';

import {MockModelHttp} from './model_http.mock';

import {parameterTests} from "./search/parameter.spec";
import {parameterMapTests} from "./search/parameter_map.spec";
import {searchResultTests} from "./search/result.spec";
import {searchResultPageTests} from "./search/result_page.spec";

export function searchTests() {
    describe('search_request', () => {
        parameterTests();
        parameterMapTests();
        searchResultPageTests();
        searchResultTests();

        testSearch();
    });

}

const MODEL_KIND = 'test::MyModel';
const SEARCH_ENDPOINT = 'search';
const SEARCH_PAGE_SIZE = 2;

function isSubstring(modelValue: string, paramValue: string) {
    return modelValue.includes(paramValue);
}

function _mkSearch(
    parameters: SearchParameter[],
    requestHandler: (options: RequestOptions) => RawResponse
): Search<any> {
    var modelHttp = new MockModelHttp(requestHandler);
    var requestFactory = new RequestFactory(modelHttp, {kind: MODEL_KIND} as ModelMetadata);
    return new Search<any>(requestFactory, parameters, identityConverter, SEARCH_PAGE_SIZE);
}

function _errHandler(options: RequestOptions): RawResponse {
    throw 'Request handler should not be called';
}


export function testSearch() {
    describe('Search', () => {
        it('should be possible to get/set/delete a parameter value', () => {
            var search = _mkSearch([{name: 'a', encoder: identityConverter}], _errHandler);
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
            function requestHandler(options: RequestOptions): RawResponse {
                expect(options.params['p']).toEqual('1', 'should add a pageId parameter to the search');
                return {
                    status: 200,
                    body: {page_id: 1, last_page: true, items: [{a: '30'}]}
                };
            }
            var search = _mkSearch([{name: 'a', encoder: identityConverter}], requestHandler);
            expect(search.hasParamValue('a')).toBe(false, 'No parameters set');
            expect(search.result.items.toArray()).toEqual([], 'no pages loaded');

            return search.result.loadNextPage().toPromise().then((result) => {
                expect(result.items.toArray()).toEqual([{a: '30'}]);
                done();
            });
        });
    });
}
