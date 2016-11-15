import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

import {TestBed, inject} from '@angular/core/testing';
import {
    ConnectionBackend, Http, HttpModule, RequestMethod, RequestOptions, BaseRequestOptions,
    Response, ResponseOptions, Headers
} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';

import {RequestFactory} from '../../../src/manager/http/request_factory';
import {_Request, Request} from '../../../src/manager/http/request';



describe('manager.http.request', () => {
    describe('_Request', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    {provide: RequestOptions, useClass: BaseRequestOptions},
                    {provide: ConnectionBackend, useClass: MockBackend},
                    Http
                ]
            });
        });



        it('should submit a request',
            inject([ConnectionBackend, Http], (backend: MockBackend, http: Http) => {
                backend.connections.subscribe((connection: MockConnection) => {
                    let request = connection.request
                    expect(request.method).toBe(RequestMethod.Get);
                    expect(request.url).toBe('http://example/path/to/resource?param=value');
                    expect(request.withCredentials).toBe(false);

                    expect(request.getBody()).toBeNull('body should not be set');

                    let response = new Response(new ResponseOptions({
                        status: 404,
                        body: {decoded: false}
                    }))

                    connection.mockRespond(response as any);
                });

                let request = new _Request(
                    http, 'http://example', new Headers(), RequestMethod.Get, ['path', 'to', 'resource'], {param: 'value'}, false
                );

                function decoder(body: any) {
                    expect(body).toEqual({decoded: false});
                    return {decoded: true};
                }
                request.send(decoder).forEach((value: any) => {
                    expect(value).toEqual({decoded: true});
                });
            })
        );

        it('should error on response statuses outside the range 200-300',
            inject([ConnectionBackend, Http], (backend: MockBackend, http: Http) => {
                backend.connections.subscribe((connection: MockConnection) => {
                    let response = new Response(new ResponseOptions({
                        status: 404,
                        body: {notFound: true}
                    }))
                    connection.mockError(response as any);
                });

                let request = new _Request(
                    http, 'http://example', new Headers(), RequestMethod.Get, ['path', 'to', 'resource'], {param: 'value'}, false
                );

                function decoder(body: any) {
                    console.log('BODY', body);
                    fail('decoder should not be called if status < 200 or status >= 300')

                }

                request.send(decoder)
                    .map(response => {
                        fail('should not complete the request');
                    })
                    .catch((err: any, caught: Observable<any>) => {
                        expect(err).toEqual(jasmine.any(Response));
                        expect(err.status).toEqual(404);
                        expect(err.json()).toEqual({notFound: true});
                        return Observable.of(null);
                    }).forEach((_) => {
                        console.log('done');
                    });
            })
        );

        it('should encode the body', inject([Http], (http: Http) => {

            let request: Request = new _Request(
                http, 'http://example', new Headers(), RequestMethod.Post, [], {}, false
            );

            function encode(body: any) {
                expect(body).toEqual({encoded: false});
                return {encoded: true};
            }

            request = request.setRequestBody({encoded: false}, encode);
            expect(request.body).toEqual({encoded: true});
        }));

        it('should handle an empty response', inject([ConnectionBackend, Http], (backend: MockBackend, http: Http) => {
            backend.connections.subscribe((connection: MockConnection) => {
                let response = new Response(new ResponseOptions({
                    status: 200,
                    body: null
                }))
                connection.mockRespond(response);
            });

            let request = new _Request(http, 'http://example', new Headers(), RequestMethod.Delete, [], {}, false);

            function decode(response: any) {
                fail('decoder should not be called on an empty response');
            }

            request.send(decode).forEach(value => {
                expect(value).toBeUndefined('response was empty');
            });
        }));

    });

});
