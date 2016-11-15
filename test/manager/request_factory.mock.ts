import 'rxjs/add/observable/timer';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';

import {Http, RequestMethod, Headers, Response, ResponseOptions} from '@angular/http';

import {Converter} from 'caesium-core/converter';
import {Codec, isCodec, getEncoder} from 'caesium-core/codec';

import {JsonObject} from '../../src/json_codecs';
import {Request, RequestFactory} from '../../src/manager/http';

export class MockResponse<T> {
    constructor(
        public request: Request,
        private _respond: Observer<T>
    ) {}

    respond(body?: T): void {
        this._respond.next(body);
        this._respond.complete();
    }

    respondError(status: number, body: JsonObject): void {
        let response = new Response(new ResponseOptions({
            status: status,
            body: body
        }));
        this._respond.error(response);
        this._respond.complete();
    }
}

export class MockRequestFactory implements RequestFactory {
    apiHostHref = '';
    withCredentials = false;
    http: Http = null;
    headers = new Headers();

    /// Emits requests as their send function has been called
    sent$ = new Subject<MockResponse<any>>();

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

    constructor(
        private factory: RequestFactory,
        public method: RequestMethod,
        public path: string[],
        public query: {[key: string]: string}
    ) { }

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
        let subject = new Subject<T>();
        let response = new MockResponse<T>(this, subject);
        return subject;
    }


}

