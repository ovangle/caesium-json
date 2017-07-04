import { ModelHttp } from '../model_http';
import { Request, Response } from './interfaces';
export declare class Get implements Request {
    kind: string;
    endpoint: string;
    http: ModelHttp;
    withCredentials: boolean;
    params: {
        [key: string]: string;
    };
    constructor(http: ModelHttp, kind: string, endpoint: string, withCredentials: boolean);
    setRequestParameters(params: {
        [key: string]: string;
    }): void;
    send(): Response;
    toString(): string;
}
