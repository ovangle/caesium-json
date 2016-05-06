import {RequestMethod} from 'angular2/http';
import {ModelHttp} from './model_http';
import {BaseRequestOptions, VoidResponse} from './interfaces';
import {BaseRequest} from "./abstract_request";

export interface DeleteOptions extends BaseRequestOptions {

}

export class Delete extends BaseRequest<void, void> {
    constructor(options: DeleteOptions, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }

    execute(): Promise<VoidResponse> {
        return this.http.request({
            method: RequestMethod.Delete, 
            kind: this.kind, 
            endpoint: this.endpoint
        }).map((response) => ({status: response.status})).toPromise();
    }

}
