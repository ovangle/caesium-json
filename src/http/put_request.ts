import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {RequestMethod} from 'angular2/http';
import {isBlank} from 'caesium-core/lang';

import {ModelHttp} from './model_http';
import {
    bodyEncoder, JsonObject, RequestBody, ResponseHandler, responseDecoder
} from './interfaces';
import {BaseRequestOptions, MutatorRequest} from "./abstract_request";

export interface PutOptions extends BaseRequestOptions { }

export class Put extends MutatorRequest {
    private body: JsonObject;

    constructor(options: PutOptions, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }

    send(): Promise<any> {
        if (isBlank(this.body))
            return Promise.reject(`Error handling ${this}: Response body uninitialized`);
        return this.http.request({
            method: RequestMethod.Put,
            kind: this.kind,
            endpoint: this.endpoint,
            body: this.body
        }).forEach((response) => this.emit(response), this);
    }


    setRequestBody<TBody>(requestBody: RequestBody<TBody>): Put {
        this.body = bodyEncoder(requestBody)(requestBody.body);
        return this;
    }
    
    toString(): string {
        return `PUT (${this.kind}, ${this.endpoint})`;
    }
}
