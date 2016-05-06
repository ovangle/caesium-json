import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {Converter} from 'caesium-core/converter';
import {JsonRequestOptions} from './interfaces';

import {
    JsonObject,
    BaseRequestOptions,
    AccessorRequestOptions,
    MutatorRequestOptions,
    AbstractResponse,
    JsonResponse,
    SingleItemResponse
} from './interfaces';
import {ModelHttp} from './model_http';

export abstract class BaseRequest<TBody,TResponse> {
    kind: string;
    endpoint: string;

    http:ModelHttp;

    responseChange:Observable<AbstractResponse>;

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

    protected emit(response:AbstractResponse) {
        this._responseSubscribers
            .filter((subscriber) => !subscriber.isUnsubscribed)
            .forEach((subscriber) => {
                subscriber.next(response);
            });
    }

    protected onResultChangeSubscription(subscriber): void {
        this._responseSubscribers = this._responseSubscribers.push(subscriber);
    }

    dispose() {
        this._responseSubscribers
            .filter((subscriber) => !subscriber.isUnsubscribed)
            .forEach((subscriber) => {
                subscriber.complete();
            });
    }
}

export abstract class AccessorRequest<TBody,TResponse> extends BaseRequest<TBody,TResponse> {
    responseDecoder: Converter<JsonObject,TResponse>;

    constructor(options: AccessorRequestOptions<TResponse>, kind: string, http: ModelHttp) {
        super(options, kind, http);
        this.responseDecoder = options.responseDecoder;
    }

    protected handleResponse(rawResponse: JsonResponse): SingleItemResponse<TResponse> {
        var response = {
            status: rawResponse.status,
            body: this.responseDecoder(response.body)
        };
        this.emit(response);
        return response;
    }
}

export abstract class MutatorRequest<TBody,TResponse> extends AccessorRequest<TBody,TResponse> {
    bodyEncoder: Converter<TBody,JsonObject>;

    constructor(options: MutatorRequestOptions<TBody, TResponse>, kind: string, http: ModelHttp) {
        super(options, kind, http);
        this.bodyEncoder = options.bodyEncoder;
    }

    abstract setRequestBody(body: TBody): Promise<SingleItemResponse<TResponse>>;
}
