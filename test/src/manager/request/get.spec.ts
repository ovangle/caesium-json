import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Observable';

import {RequestMethod} from 'angular2/http';

import {identityConverter} from 'caesium-core/converter';
import {Get} from '../../../../src/manager/request/get';

import {MockModelHttp} from '../model_http.mock';
import {RequestOptions, RawResponse} from "../../../../src/manager/model_http";

export function getTests() {
    describe('Get', () => {
        it('should be possible to get a resource', (done) => {
            function respond(requestOptions: RequestOptions): RawResponse {
                expect(requestOptions.method).toBe(RequestMethod.Get);
                expect(requestOptions.kind).toBe('test::MyModel');
                expect(requestOptions.endpoint).toBe('get_endpoint');
                expect(requestOptions.body).toBeUndefined();
                expect(requestOptions.params).toBeUndefined();

                return {
                    status: 200,
                    body: {'json': 'response'}
                }
            }

            var modelHttp = new MockModelHttp(respond);

            var request = new Get(modelHttp, 'test::MyModel', 'get_endpoint');
            var response = request.send();

            response.handle({select: 200, decoder: identityConverter})
                .toPromise().then((result) => {
                    expect(result).toEqual({'json': 'response'});
                    done();
                });

        });
    });
}
