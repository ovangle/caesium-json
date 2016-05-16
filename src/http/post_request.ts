import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {RequestMethod} from 'angular2/http';

import {isBlank} from 'caesium-core/lang';

import {ModelHttp} from './model_http';
import {JsonObject, bodyEncoder, RequestBody} from './interfaces';
import {BaseRequestOptions, MutatorRequest} from "./abstract_request";

export interface PostOptions extends BaseRequestOptions {
}

export class Post extends MutatorRequest {

    private body: JsonObject;

    constructor(options: PostOptions, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }

    send(): Promise<any> {
        if (isBlank(this.body))
            //TODO: Proper error
            throw 'Post request must have a body';
        return this.http.request({
            method: RequestMethod.Post,
            kind: this.kind,
            endpoint: this.endpoint,
            body: this.body
        }).forEach((response) => this.emit(response), this);
    }

    setRequestBody<TBody>(requestBody: RequestBody<TBody>): Post {
        this.body = bodyEncoder(requestBody)(requestBody.body);
        return this;
    }

    toString() {
        return `POST (${this.kind}, ${this.endpoint})`
    }
}
