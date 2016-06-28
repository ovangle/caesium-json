import 'rxjs/add/operator/toPromise';
import {provide} from '@angular/core';
import {
    Http, RequestOptions, RequestMethod, Response, ResponseOptions, BaseRequestOptions
} from '@angular/http';

import {beforeEachProviders, describe, it, inject} from '@angular/core/testing';

import {MockBackend, MockConnection} from '@angular/http/testing';
import {API_HOST_HREF, ModelHttp} from "../../../src/manager/model_http";


export function modelHttpTests() {
    describe('model_http', () => {
        _testModelHttp();
    });
}

function _testModelHttp() {
    describe('ModelHttp', () => {
        beforeEachProviders(() => [
            MockBackend,
            provide(RequestOptions, {useClass: BaseRequestOptions}),
            provide(Http, {
                useFactory: (backend: MockBackend, options: RequestOptions) => new Http(backend, options),
                deps: [MockBackend, RequestOptions]
            }),
            provide(API_HOST_HREF, {useValue: 'http://host'}),
            ModelHttp
        ]);

        it('should be possible to submit a request', inject([MockBackend, ModelHttp],
            (backend: MockBackend, http: ModelHttp) => {
                backend.connections.subscribe((connection: MockConnection) => {
                    var request = connection.request;
                    expect(request.method).toBe(RequestMethod.Put);
                    expect(request.url).toBe(
                        'http://host/mymodel/method_endpoint?p_one=one&p_two=two'
                    );
                    expect(request.text()).toBe('{"json":"request"}');
                    expect(request.withCredentials).toBe(true);

                    var response = new Response(new ResponseOptions({
                        url: request.url,
                        status: 200,
                        body: '{"json":"response"}'
                    }));

                    connection.mockRespond(response);
                });

                return http.request({
                    method: RequestMethod.Put,
                    kind: 'mymodel::MyModel',
                    endpoint: 'method_endpoint',
                    params: {'pOne': 'one', 'pTwo': 'two'},
                    body: {'json': 'request'},
                    withCredentials: true
                }).toPromise().then((response) => {
                    expect(response).toEqual({
                        status: 200,
                        body: {'json': 'response'}
                    });
                });

        }));

        it('should be possible to submit a request without credentials', inject([MockBackend, ModelHttp],
            (backend: MockBackend, http: ModelHttp) => {
                backend.connections.subscribe((connection:MockConnection) => {
                    var request = connection.request;
                    expect(request.method).toBe(RequestMethod.Put);
                    expect(request.url).toBe(
                        'http://host/mymodel/method_endpoint?p_one=one&p_two=two'
                    );
                    expect(request.text()).toBe('{"json":"request"}');
                    expect(request.withCredentials).toBe(false);

                    var response = new Response(new ResponseOptions({
                        url: request.url,
                        status: 200,
                        body: '{"json":"response"}'
                    }));

                    connection.mockRespond(response);
                });

                return http.request({
                    method: RequestMethod.Put,
                    kind: 'mymodel::MyModel',
                    endpoint: 'method_endpoint',
                    params: {'pOne': 'one', 'pTwo': 'two'},
                    body: {'json': 'request'},
                    withCredentials: false
                }).toPromise().then((response) => {
                    expect(response).toEqual({
                        status: 200,
                        body: {'json': 'response'}
                    });
                });
        }));
    });
}
