import 'rxjs/add/operator/filter';
import {isBlank} from 'caesium-core/lang';
import {isNumber} from '../json_codecs/interfaces';

import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

import {
    AbstractResponse,
    JsonResponse,
    ResponseFilter,
    ResponseHandler,
    responseDecoder,
    DefaultResponseHandler,
    RequestBody
} from './interfaces';
import {ModelHttp} from './model_http';

export interface BaseRequestOptions {
    /// The method to call on the server resource
    endpoint: string;
}

export abstract class BaseRequest {
    kind: string;
    endpoint: string;

    http:ModelHttp;

    responseChange:Observable<JsonResponse>;

    private _responseSubscribers: Immutable.List<Subscriber<AbstractResponse>>;

    constructor(options:BaseRequestOptions, kind: string, http:ModelHttp) {
        this.kind = kind;
        this.endpoint = options.endpoint;
        this.http = http;
        this._responseSubscribers = Immutable.List<Subscriber<AbstractResponse>>();
        this.responseChange = Observable.create((subscriber) => {
            this.onResultChangeSubscription(subscriber);
        });
    }

    protected emit(response:JsonResponse) {
        this._responseSubscribers
            .filter((subscriber) => !subscriber.isUnsubscribed)
            .forEach((subscriber) => {
                subscriber.next(response);
            });
    }

    protected onResultChangeSubscription(subscriber): void {
        this._responseSubscribers = this._responseSubscribers.push(subscriber);
    }

    /**
     * Send the request. Completes with the status of the request.
     */
    abstract send(): Promise<number>;

    dispose() {
        this._responseSubscribers
            .filter((subscriber) => !subscriber.isUnsubscribed)
            .forEach((subscriber) => {
                subscriber.complete();
            });
    }

    protected _logError(...messages: string[]) {
        console.error(`Error handling request: ${this.toString()}`);
        for (let message of messages) {
            console.error(`\t${message}`);
        }

    }

    _kindEndpoint(): string {
        return `${this.kind}.${this.endpoint}`
    }
}

export abstract class AccessorRequest extends BaseRequest {
    private _responseFilters: Immutable.List<ResponseFilter>;
    private _defaultHandler: DefaultResponseHandler;

    constructor(options:BaseRequestOptions, kind: string, http:ModelHttp) {
        super(options, kind, http);
        this._responseFilters = Immutable.List<ResponseFilter>();
        this.responseChange
            .filter((response) => this._isUnhandled(response))
            .forEach((unhandledResponse: JsonResponse) => {
                if (this._defaultHandler) {
                    var handle = this._defaultHandler.call
                        .bind(this._defaultHandler.thisArg);
                    return handle(unhandledResponse.body);
                }
                this._logError(
                    `Unhandled response (status: ${unhandledResponse.status}`,
                    JSON.stringify(unhandledResponse.body)
                );
            }, this);
    }

    addHandler<TResponse>(responseHandler: ResponseHandler<TResponse>): AccessorRequest {
        var _filter = this._addResponseFilter(responseHandler.selector);
        this.responseChange
            .filter(_filter)
            .map((response: JsonResponse) =>
                responseDecoder(responseHandler.decoder)(response.body))
            .forEach(responseHandler.call, responseHandler.thisArg)
            .catch(this._logError);
        return this;
    }

    setDefaultHandler<TResponse>(responseHandler: DefaultResponseHandler): AccessorRequest {
        this._defaultHandler = responseHandler;
        return this;
    }

    /**
     * A response is unhandled if the filters for any of the result handlers
     * do not match the response.
     *
     * @param response
     * @returns {boolean}
     * @private
     */
    private _isUnhandled(response: JsonResponse) {
        return !this._responseFilters.some((filter) => filter(response));
    }

    /**
     * Register a response filter on the request.
     * @param filter
     * @private
     */
    protected _addResponseFilter(filter: number | ResponseFilter): ResponseFilter {
        var _filter: ResponseFilter;
        // TODO: This should be in caesium-core/lang.
        if (isNumber(filter)) {
            _filter = (response) => response.status === filter;
        } else {
            _filter = filter as ResponseFilter;
        }

        this._responseFilters = this._responseFilters.push(_filter);
        return _filter;
    }
}

export abstract class MutatorRequest extends AccessorRequest {
    abstract setRequestBody<TBody>(requestBody: RequestBody<TBody>): MutatorRequest;
}
