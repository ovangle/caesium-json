import {JsonObject} from '../../json_codecs/interfaces';

import {ModelHttp} from '../model_http';
import {Request, RequestMethod, Response} from './interfaces';
import {_ObjectResponseImpl} from "./response";

export class Delete<T> implements Request {

    kind: string;
    endpoint: string;
    http: ModelHttp;
    withCredentials: boolean;

    constructor(http: ModelHttp, kind: string, endpoint: string, withCredentials: boolean) {
        this.http = http;
        this.kind = kind
        this.endpoint = endpoint;
        this.withCredentials = withCredentials;
    }

    send():Response {
        var observable = this.http.request({
            method: RequestMethod.Delete,
            kind: this.kind,
            endpoint: this.endpoint,
            withCredentials: this.withCredentials
        });
        return new _ObjectResponseImpl(this, observable);
    }

    toString() {
        return `DELETE ${this.kind}.${this.endpoint}`
    }
}
