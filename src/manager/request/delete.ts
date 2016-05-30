import {JsonObject} from '../../json_codecs/interfaces';

import {ModelHttp} from '../model_http';
import {Request, RequestMethod, Response} from './interfaces';
import {_ObjectResponseImpl} from "./response";

export class Delete<T> implements Request {

    kind: string;
    endpoint: string;
    http: ModelHttp;

    constructor(http: ModelHttp, kind: string, endpoint: string) {
        this.http = http;
        this.endpoint = endpoint;
    }

    send():Response {
        var observable = this.http.request({
            method: RequestMethod.Delete,
            kind: this.kind,
            endpoint: this.endpoint,
        });
        return new _ObjectResponseImpl(this, observable);
    }

    toString() {
        return `DELETE ${this.kind}.${this.endpoint}`
    }
}
