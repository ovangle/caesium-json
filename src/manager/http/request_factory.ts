import {Injectable, Inject, Optional, OpaqueToken} from '@angular/core';
import {Http, RequestMethod, Headers, RequestOptions} from '@angular/http';

import {isBlank} from 'caesium-core/lang';

import {Request, _Request} from './request';


/**
 * The path to the root of the json API server.
 * Default is '/api'
 * @type {OpaqueToken}
 */
export const API_HOST_HREF = new OpaqueToken('cs_api_host_href');
export const defaultApiHostHref = '/api';

/**
 * Whether the XMLHttpRequest should make credentialed requests.
 * If provided, overrides the value provided in the angular http RequestOptions.
 * @type {OpaqueToken}
 */
export const WITH_CREDENTIALS = new OpaqueToken('cs_api_host_href');
export const defaultWithCredentials = true;

//TODO: Headers for specific requests.
/**
 * Headers to include when making requests to the API endpoint.
 * These will be added *in addition to* the headers injected by @angular/http RequestOptions token.
 */
export const API_HEADERS = new OpaqueToken('cs_api_headers');
export const defaultApiHeaders = new Headers();


@Injectable()
export class RequestFactory {
    public headers: Headers;
    public apiHostHref: string;
    public withCredentials: boolean;

    constructor(
        public http: Http,
        // Options for /* all */ http requests
        requestOptions: RequestOptions,
        @Optional() @Inject(API_HOST_HREF) apiHostHref: string = defaultApiHostHref,
        @Optional() @Inject(WITH_CREDENTIALS) withCredentials: boolean = defaultWithCredentials,
        @Optional() @Inject(API_HEADERS) apiHeaders: Headers = defaultApiHeaders
    ) {
        apiHostHref = isBlank(apiHostHref) ? defaultApiHostHref : apiHostHref;
        if (apiHostHref.endsWith('/')) {
            this.apiHostHref = apiHostHref.substr(0, apiHostHref.length - 1);
        }

        let headers = new Headers(requestOptions.headers);
        if (!isBlank(apiHeaders)) {
            apiHeaders.forEach((value, key) => {
                headers.set(key, value);
            });
        }
        this.headers = headers;

        this.withCredentials = withCredentials || requestOptions.withCredentials || false;
    }

    request(method: RequestMethod, path: string[], query?: {[param: string]: string}): Request {
        return new _Request(
            this.http, this.apiHostHref, this.headers, method, path, query, this.withCredentials
        );
    }

    get(path: string[], query: {[param: string]: string}): Request {
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
