import {Observable} from 'rxjs/Observable';

import {Injectable, Inject, Optional, Provider, OpaqueToken} from '@angular/core';

import {Type, isDefined, isBlank} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';
import {memoize} from 'caesium-core/decorators';
import {ValueError} from 'caesium-core/exception';


import {ModelMetadata} from '../model/metadata';
import {MetadataProvider} from '../model/metadata_provider';
import {ModelFactory, createModelFactory} from '../model/factory';
import {InvalidMetadata, ModelNotFoundException} from '../model/exceptions';
import {ModelBase} from '../model/base';

import {model, union, JsonObject} from '../json_codecs';
import {RequestFactory, Request} from './http';

import {Search, SearchParameter,
    SEARCH_PAGE_SIZE, defaultSearchPageSize,
    SEARCH_PAGE_QUERY_PARAM, defaultSearchPageQueryParam
} from './search';


@Injectable()
export class ModelManager {
    searchPageSize: number;
    searchPageQueryParam: string;

    constructor(
        private metadatas: MetadataProvider,
        public requests: RequestFactory,

        @Optional() @Inject(SEARCH_PAGE_SIZE) searchPageSize: number = defaultSearchPageSize,
        @Optional() @Inject(SEARCH_PAGE_QUERY_PARAM) searchPageQueryParam: string = defaultSearchPageQueryParam
    ) {
        this.searchPageSize = isBlank(searchPageSize) ? defaultSearchPageSize : searchPageSize;
        this.searchPageQueryParam = isBlank(searchPageQueryParam) ? defaultSearchPageQueryParam : searchPageQueryParam;
    }

    public getModelCodec<T extends ModelBase>(type: Type/*<T>*/ | T): Codec<T,JsonObject> {
        let metadata = this.metadatas.for(type);
        if (metadata.isAbstract) {
            let subtypeMetadatas = this.metadatas.leafMetadatasForType(metadata.type);
            return union(...(subtypeMetadatas.map(meta => meta.type).toArray()));
        }
        return model<T>(metadata.type);
    }

    public getPath(type: Type/*<T>*/): Array<string> {
        let metadata = this.metadatas.for(type);
        return metadata.path;
    }


    getById<T extends ModelBase>(type: Type/*<T>*/, id: any, options?: {ignoreCache?: boolean}): Observable<T> {
        let params: {[key: string]: string} = {};

        if (options && options.ignoreCache) {
            // Add a cache busting parameter to be ignored by the server
            params['cache'] = `${new Date().valueOf()}`;
        }

        return this.requests
            .get([...this.getPath(type), id.toString()], params)
            .send(this.getModelCodec<T>(type));
    }


    /**
     * Save an instance of the model.
     *
     * If the type is provided, it must be an abstract supertype of the type of the model.
     * @param model
     * @param type
     * @returns {Observable<Codec<any, JsonObject>>}
     */
    save<T extends ModelBase>(model: T): Observable<T> {
        let request: Request;
        let metadata = this.metadatas.for(model);
        let codec = this.getModelCodec<T>(model);

        if (model.id === null) {
            request = this.requests.post([...metadata.path, 'create']);
        } else {
            request = this.requests.put([...metadata.path, `${model.id}`]);
        }

        return request.setRequestBody(model, codec).send<T>(codec);
    }

    search<T extends ModelBase>(type: Type /*<T>*/, parameters: SearchParameter[]): Search<T> {
        return new Search<T>(
            this.requests,
            this.getPath(type),
            parameters,
            this.getModelCodec<T>(type),
            this.searchPageSize,
            this.searchPageQueryParam
        );
    }

}

