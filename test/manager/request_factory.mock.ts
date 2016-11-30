import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/timer';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';

import {Injectable} from '@angular/core';
import {Http, RequestMethod, Headers, Response, ResponseOptions} from '@angular/http';

import {Converter} from 'caesium-core/converter';
import {Codec, isCodec, getEncoder, getDecoder} from 'caesium-core/codec';

import {JsonObject} from '../../src/json_codecs/index';
import {Request, RequestFactory} from '../../src/manager/http/index';

export type RequestHandler<T> = (request: T) => {status: number, body: T};

// in test
// factory.sent$.subscribe((request: MockRequest) => {
//      request.respond(200,
//
//


@Injectable()
export class MockRequestFactory implements RequestFactory {
    apiHostHref = '';
    withCredentials = false;
    http: Http = null;
    headers = new Headers();

    _sent$: Subject<MockRequest>;
    /// Emits requests as their send function has been called
    get sent$(): Observable<MockRequest> {
        return this._sent$;
    }

    constructor() {
        this._sent$ = new Subject<Request>();

    }

    request(method: RequestMethod, path: string[], query?: {[param: string]: string}): Request {
        return new MockRequest(this, method, path, query);
    }

    get(path: string[], query: {}): Request {
        return this.request(RequestMethod.Get, path, query);
    }

    post(path: string[]): Request {
        return this.request(RequestMethod.Post, path);
    }

    put(path: string[]): Request {
        return this.request(RequestMethod.Put, path);
    }

    delete(path: string[]): Request {
        return this.request(RequestMethod.Delete, path);
    }

    dispose() {
        this._sent$.complete();
    }
}

/**
 * Used for testing:
 * - Search
 * - SearchResult
 */
export class MockRequest implements Request {
    body: any;
    headers: Headers = new Headers();
    apiHostHref = '';
    withCredentials = true;

    private _respond = new Subject<any>();

    constructor(private factory: MockRequestFactory,
                public method: RequestMethod,
                public path: string[],
                public query: {[key: string]: string}) {
    }

    setRequestBody<T>(body: any, bodyEncoder: Converter<T,JsonObject> | Codec<T,JsonObject>): Request {
        let encoder: Converter<T,JsonObject>;
        if (isCodec(bodyEncoder)) {
            encoder = getEncoder(bodyEncoder as Codec<T,JsonObject>);
        } else {
            encoder = bodyEncoder as Converter<T,JsonObject>;
        }
        this.body = encoder(body);
        return this;
    }

    send<T>(bodyDecoder: any): Observable<T> {
        let decoder: Converter<T,JsonObject>;
        if (isCodec(bodyDecoder)) {
            decoder = getDecoder(<Codec<T,JsonObject>>bodyDecoder);
        } else {
            decoder = <Converter<T,JsonObject>>bodyDecoder;
        }

        window.setTimeout(() => {
            this.factory._sent$.next(this);
        });
        return Observable.defer(() => this._respond.map(body => decoder(body)));
    }

    respond(response: {status: number, body: any}) {
        if (response.status >= 200 && response.status < 300) {
            this._respond.next(response.body);
        } else {
            this._respond.error(response);
        }
        this._respond.complete();
    }

}

