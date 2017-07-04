import { Converter } from 'caesium-core/converter';
import { JsonObject } from '../../json_codecs/interfaces';
import { ModelHttp } from '../model_http';
import { Request, Response } from './interfaces';
export declare class Put<T> implements Request {
    kind: string;
    endpoint: string;
    http: ModelHttp;
    withCredentials: boolean;
    encoder: Converter<T, JsonObject>;
    body: T;
    constructor(http: ModelHttp, kind: string, endpoint: string, bodyEncoder: Converter<T, JsonObject>, withCredentials: boolean);
    setRequestBody(body: T): Put<T>;
    send(): Response;
    toString(): string;
}
