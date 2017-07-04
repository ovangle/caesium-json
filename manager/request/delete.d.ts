import { ModelHttp } from '../model_http';
import { Request, Response } from './interfaces';
export declare class Delete<T> implements Request {
    kind: string;
    endpoint: string;
    http: ModelHttp;
    withCredentials: boolean;
    constructor(http: ModelHttp, kind: string, endpoint: string, withCredentials: boolean);
    send(): Response;
    toString(): string;
}
