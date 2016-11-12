import {isDefined} from 'caesium-core/lang';
import {Codec, isCodec, getEncoder} from 'caesium-core/codec';
import {Converter} from 'caesium-core/converter';

import {JsonObject} from '../../json_codecs/interfaces';

import {ModelHttp} from '../model_http';
import {Request, RequestMethod, Response} from './interfaces';
import {StateException} from "./exceptions";
import {_ObjectResponseImpl} from "./response";

export class Put<T> implements Request {

    kind: string;
    endpoint: string;
    http: ModelHttp;
    withCredentials: boolean;

    encoder: Converter<T, JsonObject>;
    body: T;

    constructor(http: ModelHttp, kind: string, endpoint: string,
                bodyEncoder: Converter<T,JsonObject>,
                withCredentials: boolean) {
        this.kind = kind;
        this.http = http;
        this.endpoint = endpoint;
        this.withCredentials = withCredentials;
        this.encoder = bodyEncoder;

    }

    setRequestBody(body: T): Put<T> {
        this.body = body;
        return this;
    }

    send():Response {
        if (!isDefined(this.body))
            throw new StateException(`${this}: No body set on request`);

        var observable = this.http.request({
            method: RequestMethod.Put,
            kind: this.kind,
            endpoint: this.endpoint,
            body: this.encoder(this.body),
            withCredentials: this.withCredentials
        });
        return new _ObjectResponseImpl(this, observable);
    }

    toString() {
        return `PUT ${this.kind}.${this.endpoint}`
    }
}
