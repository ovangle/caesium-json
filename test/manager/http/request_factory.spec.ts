import {inject, TestBed} from '@angular/core/testing';

import {HttpModule, Http, RequestOptions, Headers, RequestMethod} from '@angular/http';

import {Request} from '../../../src/manager/http/request';
import {RequestFactory, API_HOST_HREF, API_HEADERS} from '../../../src/manager/http/request_factory';

describe('manager.http.request_factory', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            // We won't actually be sending any requests, don't bother mocking it out
            imports: [HttpModule],
            providers: [
                {provide: API_HOST_HREF, useValue: 'http://api_host/'},
                {provide: API_HEADERS, useValue: new Headers({'X-CSRFToken': 'abcdef12345'})},
                RequestFactory
            ]
        });
    });

    describe('RequestFactory', () => {
        it('should inject the appropriate values', inject([RequestFactory], (factory: RequestFactory) => {
            let request = factory.request(RequestMethod.Get, ['path'], {});
            expect(request.method).toEqual(RequestMethod.Get);
            expect(request.headers).toEqual(new Headers({'X-CSRFToken': 'abcdef12345'}));
            expect(request.withCredentials).toBe(false);
        }));

        it('should strip a trailing \'/\' from apiHostHref', inject([RequestFactory], (factory: RequestFactory) => {
            let request = factory.request(RequestMethod.Get, ['path'], {});
            expect(request.apiHostHref).toEqual('http://api_host');
        }));
    });
});
