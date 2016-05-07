import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import {RequestMethod} from 'angular2/http';
import {Converter} from 'caesium-core/converter';

import {ModelHttp} from './model_http';
import {JsonObject, JsonQuery, SingleItemResponse} from './interfaces';
import {AccessorRequestOptions} from './interfaces';
import {AccessorRequest} from "./abstract_request";

export interface GetOptions<T> extends AccessorRequestOptions<T> { }

export class Get<T> extends AccessorRequest<void,T> {
    responseDecoder: Converter<JsonObject,T>;

    constructor(options: GetOptions<T>, kind: string, http: ModelHttp) {
        super(options, kind, http);
    }

    execute(): Promise<SingleItemResponse<T>> {
       var rawResponse = this.http.request({
                method: RequestMethod.Get,
                kind: this.kind,
                endpoint: this.endpoint
       });
        return rawResponse
            .map((rawResponse) => this.handleResponse(rawResponse))
           .toPromise();
    }
}

