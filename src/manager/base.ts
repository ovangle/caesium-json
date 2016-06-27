import {Injectable, Inject, Optional} from '@angular/core';

import {Type, isDefined, isBlank} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';
import {memoize} from 'caesium-core/decorators';

import {ModelFactory, createModelFactory} from '../model/factory';
import {ModelMetadata} from '../model/metadata';
import {ModelBase} from '../model/base';

import {model, union, JsonObject} from '../json_codecs';

import {ModelHttp} from './model_http';
import {RequestFactory, Response} from './request';

import {Search, SearchParameter, SEARCH_PAGE_SIZE, SEARCH_PAGE_QUERY_PARAM} from './search';
import {NotSupportedError, InvalidMetadata, FactoryException} from "../exceptions";

/**
 * Rather than expect all manager implementations to declare @Injectable
 * _and_ the correct parameters, this class encapsulates all injectable
 * parameters for the model manager.
 */
@Injectable()
export class ManagerOptions {
    static DefaultSearchPageSize = 20;
    static DefaultSearchPageQueryParam = 'page';

    http: ModelHttp;
    searchPageSize: number;
    searchPageQueryParam: string;

    constructor(
        http: ModelHttp,
        @Optional() @Inject(SEARCH_PAGE_SIZE) searchPageSize?: number,
        @Optional() @Inject(SEARCH_PAGE_QUERY_PARAM) searchPageQueryParam?: string
    ) {
        this.http = http;
        if (isBlank(searchPageSize)) {
            this.searchPageSize = ManagerOptions.DefaultSearchPageSize;
        } else {
            this.searchPageSize = searchPageSize;
        }

        if (isBlank(searchPageQueryParam)) {
            this.searchPageQueryParam = ManagerOptions.DefaultSearchPageQueryParam;
        } else {
            this.searchPageQueryParam = searchPageQueryParam;
        }

    }
}

export abstract class ManagerBase<T extends ModelBase> {
    http: ModelHttp;
    _requestFactory: RequestFactory;
    searchPageSize: number;
    searchPageQueryParam: string;


    abstract getModelType(): Type/*<T>*/;

    /**
     * Get a list of the proper subtypes of the model.
     */
    abstract getModelSubtypes(): Type/*<U extends T>*/[];

    /**
     * Get the search parameters that are applicable to the `search` exposed by
     * this manager.
     *
     * If the model does not support any search, should return `undefined`
     */
    abstract getSearchParameters(): SearchParameter[];

    protected get __metadata(): ModelMetadata {
        return ModelMetadata.forType(this.getModelType());
    }

    constructor(options: ManagerOptions) {
        this.http = options.http;
        this._requestFactory = new RequestFactory(this.http, this.__metadata);
        this.searchPageSize = options.searchPageSize;
        this.searchPageQueryParam = options.searchPageQueryParam;
    }

    isManagerFor(type: Type): boolean {
        if (type === this.getModelType())
            return true;
        var subtypes = this.getModelSubtypes();
        if (!Array.isArray(subtypes))
            return false;
        return subtypes.some((stype) => stype === type);
    }

    /// Create a new instance of the modelType.
    create<U extends T>(subtype: Type/*<U>*/, args: {[propName: string]: any}): U {
        var factory: ModelFactory<U>;
        if (this.__metadata.isAbstract) {
            var modelSubtypes = this.getModelSubtypes();
            if (!Array.isArray(modelSubtypes) || !modelSubtypes.find((s) => s === subtype)) {
                throw new FactoryException(
                    `Subtype must be a registered subtype of model manager for '${this.__metadata.kind}'`
                );
            }
            factory = createModelFactory<U>(ModelMetadata.forType(subtype));
        } else {
            factory = createModelFactory<U>(this.__metadata);
        }
        return factory(args);
    }

    @memoize()
    private _getDefaultJsonCodec(): Codec<T,JsonObject> {
        var modelSubtypes = this.getModelSubtypes();
        if (Array.isArray(modelSubtypes) && modelSubtypes.length > 0) {
            return union(...this.getModelSubtypes());
        } else if (this.__metadata.isAbstract) {
            throw new InvalidMetadata(
                'A manager for an abstract model type must provide a nonempty list of subtypes'
            );
        } else {
            return model<T>(this.getModelType());
        }
    }

    get modelCodec(): Codec<T,JsonObject> {
        return this._getDefaultJsonCodec();
    }

    getById(id: any): Response {
        var request = this._requestFactory.get(id.toString());
        return request.send();
    }

    /**
     * Get all models with the specified foreign key value.
     *
     * For example, given the model
     *
     *      @Model({kind: 'example::MyModel'})
     *      export abstract class MyModel extends ModelBase {
     *          @RefProperty({refName: 'foreign'})
     *          foreignId: number;
     *          foreign: ForeignModel;
     *      }
     *
     * and the model
     *
     *      @Model({kind: 'example::ForeignModel'})
     *      export abstract class ForeignModel extends ModelBase {
     *      }
     *
     * Then the 'getByReferences('foreignId', foreignModel)' method on the MyModel manager
     * would submit a request:
     *
     *      http://host_href/example?foreign_id=<foreignModel.id>
     *
     * would return a response
     * {
     *  items: [<all MyModel instances where myModel.foreignId === foreignModel.id>]
     * }
     *
     * NOTE:
     * The 'items' key should be present in all responses to this method, even if the
     * relationship is one-to-one.
     *
     *
     * @param foreignModel
     * @param refName
     * @returns {Response}
     */
    getAllByReference(refName: string, foreignModel: ModelBase) : Response {
        var request = this._requestFactory.get('');
        request.setRequestParameters({
            [refName]: foreignModel.id.toString()
        });
        return request.send();
    }

    search(): Search<T> {
        if (!isDefined(this.getSearchParameters())) {
            throw new NotSupportedError(`${this.getModelType()} manager does not support search`);
        }
        return new Search<T>(
            this._requestFactory,
            this.getSearchParameters(),
            this.modelCodec,
            this.searchPageSize,
            this.searchPageQueryParam
        );
    }

}

