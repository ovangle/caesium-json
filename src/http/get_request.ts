import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {RequestMethod} from 'angular2/http';

import {ModelHttp} from './model_http';
import {JsonResponse} from './interfaces';
import {BaseRequestOptions, AccessorRequest} from "./abstract_request";

export interface GetOptions extends BaseRequestOptions { }

export class Get extends AccessorRequest {

    constructor(options: GetOptions, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }

    send(): Promise<number> {
        var request = this.http.request({
            method: RequestMethod.Get,
            kind: this.kind,
            endpoint: this.endpoint
        });

        return request.toPromise().then((response: JsonResponse) => {
            this.emit(response);
            return response.status;
        }).catch((err) => {
            this.emit(err);
        })
    }

    toString() {
        return `GET (${this.kind}, ${this.endpoint})`;
    }
}

