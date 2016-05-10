import {Codec} from 'caesium-core/codec';
import {memoize} from 'caesium-core/decorators';

import {createModelFactory} from './factory';
import {ModelBase} from './base';

import {ManagerMetadata} from "./metadata";
import {model} from "../json_codecs/model_to_json";
import {JsonObject} from '../json_codecs/interfaces';
import {
    ModelHttp,
    GetOptions, Get,
    PostOptions, Post,
    PutOptions, Put,
    DeleteOptions, Delete,
    SearchOptions, Search
} from "../http";

export const SEARCH_PAGE_SIZE = 20;

export class ModelManager<T extends ModelBase> {
    http: ModelHttp;

    private get __metadata(): ManagerMetadata {
        return ManagerMetadata.forType(Object.getPrototypeOf(this).constructor);
    }

    constructor(http: ModelHttp) {
        this.http = http;
    }

    /// Create a new instance of the modelType.
    create(args: {[propName: string]: any}): T {
        var creator = createModelFactory<T>(this.__metadata.modelMetadata);
        return creator(args);
    }

    @memoize()
    private _getDefaultJsonCodec<U extends ModelBase>(): Codec<U,JsonObject> {
        // U should always satisfy U === T, but the response and body types
        // for a method might not be the same.
        // To satisfy the type checker, the method is parameterised seperately
        // and it is assumed that whenever we need to provide a defualt codec,
        // the parameter will be T.
        return model<U>(this.__metadata.modelType);
    }

    get modelCodec(): Codec<T,JsonObject> {
        return this._getDefaultJsonCodec<T>();
    }

    // Standard request methods

    /// Submit a 'GET' request to the server.
    /// Unlike normal HTTP requests, a GET method should always return a single record
    /// in the result object.
    get(options: GetOptions): Get {
        return new Get(options, this.__metadata.kind, this.http);
    }

    put(options: PutOptions): Put {
        return new Put(options, this.__metadata.kind, this.http);
    }

    post(options: PostOptions): Post {
        return new Post(options, this.__metadata.kind, this.http);
    }

    delete(options: DeleteOptions): Delete {
        return new Delete(options, this.__metadata.kind, this.http);
    }

    search<TResponse>(options: SearchOptions<TResponse>): Search<TResponse> {
        // TODO: PAGE_SIZE needs to be injected
        return new Search<TResponse>(options, this.__metadata.kind, SEARCH_PAGE_SIZE, this.http);
    }
}

