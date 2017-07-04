import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/publish';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Set } from 'immutable';
import { RawResponse } from '../model_http';
import { Request, Response, ResponseHandler } from './interfaces';
/**
 * The implementation class for all responses which contain a single
 * json object as the response body (Get, Put, Post)
 */
export declare class _ObjectResponseImpl implements Response {
    request: Request;
    _rawResponses: ConnectableObservable<RawResponse>;
    _rawResponseSubscription: Subscription;
    _handledStatuses: Set<number>;
    constructor(request: Request, _rawResponses: Observable<RawResponse>);
    readonly unhandled: Observable<RawResponse>;
    handle<T>(handler: ResponseHandler<T>): Observable<T>;
}
