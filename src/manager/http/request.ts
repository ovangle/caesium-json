import {List} from 'immutable';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

import {
    Headers, Http, RequestMethod, URLSearchParams,
    Request as HttpRequest, RequestOptions as HttpRequestOptions, Response as HttpResponse
} from '@angular/http';

import {isBlank, forEachOwnProperty} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';
import {Codec, isCodec, getDecoder, getEncoder} from 'caesium-core/codec';
import {ValueError} from 'caesium-core/exception';


import {JsonObject} from '../../json_codecs';
import {camelCaseToSnakeCase} from '../../json_codecs/string_case_converters';

export interface Request {
    apiHostHref: string;
    method: RequestMethod;
    headers: Headers;
    path: string[];
    query: {[key: string]: string};
    body: JsonObject | undefined;
    withCredentials: boolean;

    setRequestBody<T>(body: T, encoder: Codec<T,JsonObject> | Converter<T,JsonObject>): Request;
    send<T>(decoder: Codec<T,JsonObject> | Converter<JsonObject,T>): Observable<T>;
}

export class _Request implements Request {
    public body: JsonObject | null;

    constructor(
        public http: Http,
        public apiHostHref: string,
        public headers: Headers,
        public method: RequestMethod,
        public path: string[],
        public query: {[param: string]: string},
        public withCredentials: boolean
    ) {
        this.body = null;
    }

    setRequestBody<T>(body: T, encoder: Converter<T,JsonObject> | Codec<T,JsonObject>): Request {
        let _encoder: Converter<T,JsonObject> =
            isCodec(encoder)
                ? getEncoder(<Codec<T,JsonObject>>encoder)
                : (encoder as Converter<T,JsonObject>);
        this.body = _encoder(body);
        return this;
    }

    send<R>(decoder: Converter<JsonObject,R> | Codec<R,JsonObject>): Observable<R> {
        //FIXME: These should be provided in bootstrap by
        let headers = new Headers(this.headers);
        if (this.body) {
            headers.set('Content-Type', 'application/json; charset=utf-8');
        }
        headers.set('X-CSRFToken', _getCSRFToken());

        if (isCodec(decoder)) {
            decoder = getDecoder(<Codec<R,JsonObject>>decoder);
         }

        if (isBlank(decoder)) {
            return Observable.throw(new ValueError('ModelHttpRequest: Decoder should not be null'));
        }

        let request = new HttpRequest(new HttpRequestOptions({
            url: [this.apiHostHref, ...this.path].join('/'),
            method: this.method,
            headers: new Headers(this.headers),
            search: stringMapToURLSearchParams(this.query),
            body: this.body && JSON.stringify(this.body),
            withCredentials: this.withCredentials
        }));

        return this.http.request(request)
            .map((response: HttpResponse) => {
                // Some methods (DELETE) return an empty response
                if (response.text() === '')
                    return undefined;
                return (decoder as Converter<JsonObject,R>)(response.json())
            });
    }
}

//TODO: Don't use session authentication, use JWT tokens instead.
function _getCSRFToken() {
    var name = 'csrftoken';
    if (document.cookie && document.cookie !== '') {
        var csrfCookie= List<string>(document.cookie.split(';')).valueSeq()
            .map(cookie => cookie.trim())
            .find(cookie => cookie.substring(0, name.length) === name);
        if (csrfCookie !== null) {
            return decodeURIComponent(csrfCookie.substring(name.length + 1));
        }
    }
    return null;
}

function stringMapToURLSearchParams(stringMap: {[key: string]: string}): URLSearchParams {
    var searchParams = new URLSearchParams();
    forEachOwnProperty(stringMap, (value, param) => {
        searchParams.set(camelCaseToSnakeCase(param), value);
    });
    return searchParams;
}
