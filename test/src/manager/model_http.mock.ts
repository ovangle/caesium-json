import 'rxjs/add/observable/timer';
import {Observable} from 'rxjs/Observable';

import {Http} from 'angular2/http';
import {ModelHttp, RequestOptions, RawResponse} from "../../../src/manager/model_http";

/**
 * Used for testing:
 * - Search
 * - SearchResult
 */
export class MockModelHttp extends ModelHttp {
    protected http:Http;
    protected apiHostHref:string;

    private _handleRequest: (options: RequestOptions) => RawResponse;

    constructor(handleRequest: (options: RequestOptions) => RawResponse) {
        super(null, null);
        this._handleRequest = handleRequest;
    }

    request(options:RequestOptions):Observable<RawResponse> {
        //Random delay between 0 and 500 ms
        var delay = Math.floor(500 * Math.random());
        
        return Observable.timer(delay)
            .map((_) => {
                return this._handleRequest(options)
            });
    }

}
