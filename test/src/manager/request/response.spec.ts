import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

import {identityConverter} from 'caesium-core/converter';

import {JsonObject} from '../../../../src/json_codecs';
import {_ObjectResponseImpl} from "../../../../src/manager/request/response";
import {RawResponse} from "../../../../src/manager/model_http";

function _mkObservable(rawResponse: RawResponse): Observable<RawResponse> {
    // Random delay between 0 and 500 ms
    var delay = Math.floor(Math.random() * 500);
    return Observable.timer(delay).map((_) => rawResponse).first();
}

export function responseTests() {
    describe('_ObjectResponseImpl', () => {
        it('should handle the response if selected by the handler', (done) => {
            var observable = _mkObservable({status: 200, body: {'json': 'response'}});

            var response = new _ObjectResponseImpl(null, observable);

            var handle200Response = response.handle({
                select: 200,
                decoder: identityConverter
            }).toPromise().then((body: any) => {
                expect(body).toEqual({'json': 'response'});
            });


            Promise.all([handle200Response]).then((_) => {
                done();
            });
        });

        it('should not emit an unhandled response if there is an appropriate handler', (done) => {
            var observable = _mkObservable({ status: 200, body: {'json': 'response'} });

            var response = new _ObjectResponseImpl(null, observable);

            var handle200Response = response.handle({
                select: 200,
                decoder: (body:JsonObject) => body
            }).toPromise();

            var EMPTY_RESPONSE = {};
            var unhandledResponse = response.unhandled.defaultIfEmpty(EMPTY_RESPONSE).toPromise().then((value) => {
                expect(value).toBe(EMPTY_RESPONSE);
            });

            Promise.all([handle200Response, unhandledResponse]).then((_) => {
                done();
            });
        });

        it('should emit the response on all the handlers that select it', (done) => {
            var observable = _mkObservable({ status: 200, body: {'json': 'response'} });

            var response = new _ObjectResponseImpl(null, observable);

            var handle200Response1 = response.handle({
                select: [200],
                decoder: (body:JsonObject) => ({'json': body['json'] + ' one'})
            }).toPromise().then((body) => {
                expect(body).toEqual({'json': 'response one'});
            });

            var handle200Response2 = response.handle({
                select: [200,201],
                decoder: (body: JsonObject) => ({'json': body['json'] + ' two'})
            }).toPromise().then((body) => {
                expect(body).toEqual({'json': 'response two'})
            });

            Promise.all([handle200Response1, handle200Response2])
                .catch((err) => fail(err))
                .then((_) => done());
        });

        it('should emit the response only on the selected handler', (done) => {
            var observable = _mkObservable({status: 200, body: {'json': 'response'}});

            const EMPTY = {};

            var response = new _ObjectResponseImpl(null, observable);

            var handle_100 = response.handle({
                select: 100,
                decoder: identityConverter
            }).defaultIfEmpty(EMPTY).toPromise().then((value) => {
                expect(value).toBe(EMPTY);
            });

            var handle_200 = response.handle({
                select: 200,
                decoder: identityConverter
            }).defaultIfEmpty(EMPTY).toPromise().then((value) => {
                expect(value).not.toBe(EMPTY);
            });

            var handle_300 = response.handle({
                select: 300,
                decoder: identityConverter
            }).defaultIfEmpty(EMPTY).toPromise().then((value) => {
                expect(value).toBe(EMPTY);
            });

            Promise.all([handle_100, handle_200, handle_300])
                .catch((err) => fail(err))
                .then((_) => done());
        });


        it('should emit an unhandled response if there is no handler that selects it', (done) => {
            var observable = _mkObservable({status: 201, body: {'json': 'response'}});

            var response = new _ObjectResponseImpl(null, observable);

            var handle200Response = response.handle({
                select: 200,
                decoder: identityConverter
            }).toPromise();

            var EMPTY_RESPONSE = {};
            var unhandledResponse = response.unhandled.defaultIfEmpty(EMPTY_RESPONSE).toPromise().then((value) => {
                expect(value).toEqual({status: 201, body: {'json': 'response'}});
                expect(value).not.toBe(EMPTY_RESPONSE);
            });

            Promise.all([handle200Response, unhandledResponse])
                .catch((err) => fail(err))
                .then((_) => done());
        });
    });
}
