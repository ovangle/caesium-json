import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/publish';
import {ConnectableObservable} from 'rxjs/observable/ConnectableObservable';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Set} from 'immutable';

import {Codec, isCodec, getDecoder} from 'caesium-core/codec';
import {Converter} from 'caesium-core/converter';

import {JsonObject} from '../../json_codecs/interfaces';
import {RawResponse} from '../model_http';
import {Request, Response, ResponseHandler} from './interfaces';


/**
 * The implementation class for all responses which contain a single
 * json object as the response body (Get, Put, Post)
 */
export class _ObjectResponseImpl implements Response {
    request: Request;

    _rawResponses: ConnectableObservable<RawResponse>;
    _rawResponseSubscription: Subscription;

    _handledStatuses: Set<number>;

    constructor(request: Request, _rawResponses: Observable<RawResponse>) {
        this.request = request;
        this._rawResponses = _rawResponses.publish();
        this._handledStatuses = Set<any>();

        this._rawResponseSubscription = this._rawResponses.connect();
    }

    get unhandled(): Observable<RawResponse> {
        return this._rawResponses
            .filter((response) => !this._handledStatuses.contains(response.status));
    }

    handle<T>(handler: ResponseHandler<T>): Observable<T> {
        var decoder: Converter<JsonObject,T>;
        if (isCodec(handler.decoder)) {
            decoder = getDecoder(handler.decoder as Codec<T,JsonObject>);
        } else {
            decoder = handler.decoder as Converter<JsonObject,T>;
        }

        var handleStatuses: Set<number>;
        if (Array.isArray(handler.select)) {
            handleStatuses = Set<number>(handler.select);
        } else {
            handleStatuses = Set<number>([handler.select]);
        }

        this._handledStatuses = this._handledStatuses.union(handleStatuses);

        return this._rawResponses
            .filter((response) => handleStatuses.contains(response.status))
            .map((response) => decoder(response.body))
    }
}



