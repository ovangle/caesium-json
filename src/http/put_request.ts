import {RequestMethod} from 'angular2/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {ModelHttp} from './model_http';
import {MutatorRequestOptions, SingleItemResponse} from './interfaces';
import {MutatorRequest} from "./abstract_request";

export interface PutOptions<TBody,TResponse> extends MutatorRequestOptions<TBody,TResponse> {

}

export class Put<TBody,TResponse> extends MutatorRequest<TBody,TResponse> {

    constructor(options: PutOptions<TBody,TResponse>, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }


    setRequestBody(body: TBody): Promise<SingleItemResponse<TResponse>> {
        var rawResponse = this.http.request({
            method: RequestMethod.Put,
            kind: this.kind,
            endpoint: this.endpoint,
            body: this.bodyEncoder(body)
        });
        return rawResponse
            .map(this.handleResponse)
            .toPromise();
    }
}
