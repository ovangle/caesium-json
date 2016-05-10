import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

import {OpaqueToken, Inject, Injectable} from "angular2/core";
import {Http, Request, RequestOptions, RequestMethod, URLSearchParams} from 'angular2/http';

import {isDefined, forEachOwnProperty} from 'caesium-core/lang';

import {StringMap} from "../json_codecs/interfaces";
import {JsonObject, JsonRequestOptions, JsonResponse} from './interfaces';


export const API_HOST_HREF = new OpaqueToken("cs_api_host_href");

function buildUrlParams(params: StringMap): URLSearchParams {
    var searchParams = new URLSearchParams();
    forEachOwnProperty(params, (value, param) => {
        searchParams.set(param, value);
    });
    return searchParams;
}

function buildUrl(apiHost: string, modelKind: string, endpoint: string) {
    var kindPath = `${modelKind.split('::')[0].replace(/\./, '/')}`;
    return `${apiHost}/${kindPath}/${endpoint}`
}

@Injectable()
export class ModelHttp {
    apiHostHref: string;
    http: Http;

    constructor(
        @Inject(API_HOST_HREF) apiHostHref: string,
        http: Http
    ) {
        this.apiHostHref = apiHostHref;
        this.http = http;
    }

    request(args: JsonRequestOptions): Observable<JsonResponse> {
        let request = new Request(new RequestOptions({
            method: args.method,
            url: buildUrl(this.apiHostHref, args.kind, args.endpoint),
            search: buildUrlParams(args.params),
            body: isDefined(args.body) ? JSON.stringify(args.body) : null
        }));

        return this.http.request(request)
            .map((response) => ({
                status: response.status,
                body: response.json()
            }));
    }


}
