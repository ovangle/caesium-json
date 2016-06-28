import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {Codec} from 'caesium-core/codec';
import {Converter} from 'caesium-core/converter';

import {JsonObject} from '../../json_codecs/interfaces';
import {ModelHttp, RawResponse} from '../model_http';

export {RequestMethod} from '@angular/http';

export interface Request {
    kind: string;
    endpoint: string;
    http: ModelHttp;
    withCredentials: boolean;

    send(): Response;
}

export interface ResponseHandler<T> {
    select: number | number[];
    decoder:Codec<T,JsonObject> | Converter<JsonObject,T>;
}

export interface Response {
    request:Request;

    handle<T>(handler:ResponseHandler<T>):Observable<T>;

    /**
     * All responses which are not selected by one of the handlers
     * are emitted on this observable.
     */
    unhandled: Observable<RawResponse>;
}
