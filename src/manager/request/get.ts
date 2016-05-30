import {ModelHttp} from '../model_http';
import {Request, RequestMethod, Response} from './interfaces';
import {_ObjectResponseImpl} from './response';

export class Get implements Request {
    kind: string;
    endpoint:string;
    http:ModelHttp;
    
    params: {[key: string]: string};

    constructor(http: ModelHttp, kind: string, endpoint: string) {
        this.http = http;
        this.kind = kind;
        this.endpoint = endpoint;
    }
    
    setRequestParameters(params: {[key: string]: string}) {
        this.params = params;
    }

    send():Response {
        var rawResponses = this.http.request({  
            method: RequestMethod.Get,
            kind: this.kind,
            endpoint: this.endpoint,
            params: this.params
        });

        return new _ObjectResponseImpl(this, rawResponses);
    }

    toString() {
        return `GET ${this.kind}.${this.endpoint}`;
    }

}
