import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { OpaqueToken } from '@angular/core';
import { RequestMethod, Http } from '@angular/http';
import { JsonObject } from '../json_codecs/interfaces';
export declare const API_HOST_HREF: OpaqueToken;
export interface RequestOptions {
    method: RequestMethod;
    kind: string;
    endpoint: string;
    params?: {
        [param: string]: string;
    };
    body?: JsonObject;
    withCredentials: boolean;
    isEmptyResponse?: boolean;
}
export interface RawResponse {
    status: number;
    body: JsonObject;
}
export declare class ModelHttp {
    protected http: Http;
    protected apiHostHref: string;
    constructor(http: Http, apiHostHref: string);
    private _getCSRFToken();
    request(options: RequestOptions): Observable<RawResponse>;
}
