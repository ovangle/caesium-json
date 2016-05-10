import 'rxjs/add/operator/map';

import {Observable} from 'rxjs/Observable';

import {RequestMethod} from 'angular2/http';
import {ModelHttp} from './model_http';
import {JsonResponse} from './interfaces';
import {BaseRequestOptions, BaseRequest} from "./abstract_request";

export interface DeleteOptions extends BaseRequestOptions {

}

export class Delete extends BaseRequest {
    constructor(options: DeleteOptions, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }

    send(): Promise<any> {
        return this.http.request({
            method: RequestMethod.Delete,
            kind: this.kind,
            endpoint: this.endpoint
        }).toPromise().then((response: JsonResponse) => {
            this.emit(response);
            return response.status;  
        });
    }

    toString() { return `DELETE (${this.kind}, ${this.endpoint})`; }

}
