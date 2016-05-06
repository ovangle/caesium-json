import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {RequestMethod} from 'angular2/http';
import {ModelHttp} from './model_http';
import {MutatorRequestOptions, SingleItemResponse} from "./interfaces";
import {MutatorRequest} from "./abstract_request";

export interface PostOptions<TBody,TResponse> extends MutatorRequestOptions<TBody,TResponse> {
}

export class Post<TBody,TResponse> extends MutatorRequest<TBody,TResponse> {

    constructor(options: PostOptions<TBody,TResponse>, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }

    setRequestBody(body: TBody): Promise<SingleItemResponse<TResponse>> {
        return this.http.request({
            method: RequestMethod.Post,
            kind: this.kind,
            endpoint: this.endpoint,
            body: this.bodyEncoder(body)
        }).map(this.handleResponse).toPromise();
    }
}
