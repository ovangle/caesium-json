import {Iterable, List} from 'immutable';
import {Observable} from 'rxjs/Observable';

import {Injectable, Inject, Optional, Provider, OpaqueToken} from '@angular/core';

import {Type, isDefined, isBlank} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';
import {memoize} from 'caesium-core/decorators';
import {ValueError} from 'caesium-core/exception';

import {ModelMetadata, PropertyMetadata, RefPropertyMetadata} from '../model/metadata';
import {MetadataProvider} from '../model/metadata_provider';
import {ModelFactory, createModelFactory} from '../model/factory';
import {InvalidMetadata, ModelNotFoundException, PropertyNotFoundException} from '../model/exceptions';
import {ModelBase} from '../model/base';

import {model, itemList, union, JsonObject} from '../json_codecs/index';
import {RequestFactory, Request} from './http/index';

import {Search, SearchParameter,
    SEARCH_PAGE_SIZE, defaultSearchPageSize,
    SEARCH_PAGE_QUERY_PARAM, defaultSearchPageQueryParam
} from './search';

/**
 * Provides a number of utility functions for models which meet the following criteria
 *
 * - The model must have a unique identifying property, with `key: true`
 * - The model must have a path
 * - Given an ID, the model can be loaded via a GET request to `${model.path}/${id}`
 *    or return a 404 response if the ID was not found.
 * - Given a list of IDs, the models can be loaded via a GET request to
 *      `${model.path}?ids=${idList.join(',')}`
 *   The request should return the results wrapped in a JSON object with a single key `items`
 *   The result should _NOT_ be paginated.
 *
 * - An instance can be created via a POST request to `${model.path}`
 * - An instance can be updated via a PUT request to `${model.path}/${model.id}`
 *
 * Only managed models can be used as reference properties.
 */
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

        if (!metadata.isManaged)
            throw new InvalidMetadata(`${type} is not a managed model`);

        return metadata.path;
    }

    private getKey(managedModel: ModelBase): string | number | null {
        // Also test whether the model is registered
        let metadata = this.metadatas.for(managedModel);

        if (!metadata.isManaged) {
            throw new InvalidMetadata(`${metadata.type} is not a managed model`);
        }

        return managedModel.get(metadata.keyProperty.name);
    }

    load<T extends ModelBase>(type: Type/*<T>*/, id: string | number, options?: {ignoreCache?: boolean}): Observable<T> {
        let params: {[key: string]: string} = {};

        if (options && options.ignoreCache) {
            // Add a cache busting parameter to be ignored by the server
            params['cache'] = `${new Date().valueOf()}`;
        }

        return this.requests
            .get([...this.getPath(type), id.toString()], params)
            .send(this.getModelCodec<T>(type));
    }

    loadMany<T extends ModelBase>(type: Type/*<T>*/, ids: Iterable<any, string | number>, options?: {ignoreCache?: boolean}): Observable<List<T>> {
        let params: {[key: string]: string} = {
            'ids': ids.map(id => id.toString()).join(',')
        };

        if (options && options.ignoreCache) {
            params['cache'] = `${new Date().valueOf()}`;
        }

        return this.requests
            .get([...this.getPath(type)], params)
            .send(itemList(this.getModelCodec<T>(type)));
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

        if (this.getKey(model) === null) {
            request = this.requests.post([...metadata.path]);
        } else {
            request = this.requests.put([...metadata.path, this.getKey(model).toString()]);
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


    /**
     * Load the value of the reference property, given by either it's reference
     * or property name, from the server, returning the model with the property
     * resolved.
     *
     * @param type
     * @param propNameOrRefName
     * @returns {any}
     */
    resolve<T extends ModelBase>(model: T, propNameOrRefName:string):Observable<T> {
        if (model.isResolved(propNameOrRefName)) {
            return Observable.of(model);
        }
        // Cannot use this.metadatas, since the model may be nested and therefore not registered
        let metadata: ModelMetadata = (model as any).__metadata__;
        let property = metadata.getProperty(propNameOrRefName);

        if (!property.isRef) {
            return Observable.throw(new PropertyNotFoundException(propNameOrRefName, this, 'Reference'));
        }
        // Fetch the value of the foreign ID by name, even if the reference name was passed.
        let idValue = model.get(property.name);


        let prop = <RefPropertyMetadata>property;

        if (isBlank(idValue)) {
            // A null id maps to a null reference.
            let resolved = model.set(prop.refName, null)
            return Observable.of(resolved);
        } else if (property.isMulti) {
            return this.loadMany(prop.refType, idValue)
                .map((foreignModels) => model.set(prop.refName, foreignModels))
        } else {
            return this.load(prop.refType, idValue)
                .map((foreignModel) => {
                    return model.set(prop.refName, foreignModel)
                });
        }
    }

}

