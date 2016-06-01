import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

import {Inject, Injectable, OpaqueToken} from '@angular/core';
import {
    RequestMethod, URLSearchParams, Http, Request,
    RequestOptions as NgRequestOptions
} from '@angular/http';

import {isDefined, forEachOwnProperty} from 'caesium-core/lang';

import {JsonObject} from '../json_codecs/interfaces';

export const API_HOST_HREF = new OpaqueToken('cs_api_host_href');

export interface RequestOptions {
    method: RequestMethod;
    kind: string;
    endpoint: string;
    params?: {[param: string]: string};
    body?: JsonObject;
}

export interface RawResponse {
    status: number;
    body: JsonObject;
}

function stringMapToURLSearchParams(stringMap: {[key: string]: string}): URLSearchParams {
    var searchParams = new URLSearchParams();
    forEachOwnProperty(stringMap, (value, param) => {
        searchParams.set(param, value);
    });
    return searchParams;
}


function buildEndpointUrl(apiHostHref: string, modelKind: string, endpoint: string) {
    let kindPath = modelKind.split('::')[0].replace(/\./, '/');
    return `${apiHostHref}/${kindPath}/${endpoint}`;
}

@Injectable()
export class ModelHttp {
    protected http: Http;
    protected apiHostHref: string;

    constructor(
        http: Http,
        @Inject(API_HOST_HREF) apiHostHref: string
    ) {
        this.http = http;
        this.apiHostHref = apiHostHref;
    }


    request(options: RequestOptions): Observable<RawResponse> {
        let request = new Request(new NgRequestOptions({
            method: options.method,
            url: buildEndpointUrl(this.apiHostHref, options.kind, options.endpoint),
            search: stringMapToURLSearchParams(options.params),
            body: isDefined(options.body)? JSON.stringify(options.body): null
        }));

        return this.http.request(request)
            .map((response) => ({
                status: response.status,
                body: response.json()
            }));
    }
}



