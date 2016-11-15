import {Observable} from 'rxjs/Observable';

import {Injectable, Inject, Optional} from '@angular/core';

import {Type, isDefined, isBlank} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';
import {memoize} from 'caesium-core/decorators';
import {ValueError} from 'caesium-core/exception';

import {ModelFactory, createModelFactory} from '../model/factory';
import {InvalidMetadata} from '../model/exceptions';
import {ModelMetadata} from '../model/metadata';
import {ModelBase} from '../model/base';

import {model, union, JsonObject} from '../json_codecs';
import {RequestFactory, Request} from './http';

import {Search, SearchParameter,
    SEARCH_PAGE_SIZE, defaultSearchPageSize,
    SEARCH_PAGE_QUERY_PARAM, defaultSearchPageQueryParam
} from './search';

// TODO: This is all that is required for a manager to be injectable.
//      export const MY_MODEL_MANAGER = new OpaqueToken('model_manager')
//
//      // Provider
//      CaesiumModel.provideManagers([
//          { manager: MY_MODEL_MANAGER, for: MyModel, related: [RELATED_MODEL_MANAGER] }
//      ])
//
//
//
//      class MyComponent {
//          constructor(@Inject(MY_MODEL_MANAGER) public manager: ModelManager<MyModel>) {
//          }
//
//      }

//    @Injectable()
//    export class MyModelManager extends Manager<MyModel> {
//          public type = MyModel;
//          public path = ['mymodel'];
//    }
//

/**
 * Rather than expect all manager implementations to declare @Injectable
 * _and_ the correct parameters, this class encapsulates all injectable
 * parameters for the model manager.
 */
@Injectable()
export class ManagerOptions {
    static DefaultSearchPageSize = 20;
    static DefaultSearchPageQueryParam = 'page';

    constructor(
        public request: RequestFactory,
        @Optional() @Inject(SEARCH_PAGE_SIZE) public searchPageSize: number = defaultSearchPageSize,
        @Optional() @Inject(SEARCH_PAGE_QUERY_PARAM) public searchPageQueryParam: string = defaultSearchPageQueryParam
    ) {}
}


@Injectable()
export abstract class ManagerBase<T extends ModelBase> {
    request: RequestFactory;
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

    get path(): Array<string> {
        let [path, type] = this.__metadata.kind.split('::');
        return path.split('.');
    }

    constructor(options: ManagerOptions) {
        this.request = options.request;
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

    @memoize()
    private _getDefaultJsonCodec(): Codec<T,JsonObject> {
        var modelSubtypes = this.getModelSubtypes();
        if (Array.isArray(modelSubtypes) && modelSubtypes.length > 0) {
            return union(...this.getModelSubtypes());
        } else if (this.__metadata.isAbstract) {
            throw new InvalidMetadata('A manager for an abstract model type must provide a nonempty list of subtypes');
        } else {
            return model<T>(this.getModelType());
        }
    }

    get modelCodec(): Codec<T,JsonObject> {
        return this._getDefaultJsonCodec();
    }


    getById(id: any, options?: {ignoreCache?: boolean}): Observable<T> {
        let params: {[key: string]: string} = {};

        if (options && options.ignoreCache) {
            // Add a cache busting parameter to be ignored by the server
            params['cache'] = `${new Date().valueOf()}`;
        }

        return this.request
            .get([...this.path, id.toString()], params)
            .send(this.modelCodec);
    }


    save(model: T): Observable<T> {
        let request: Request;

        if (model.id === null) {
            request = this.request.post([...this.path, 'create']);
        } else {
            request = this.request.put([...this.path, `${model.id}`]);
        }

        return request
            .setRequestBody(model, this.modelCodec)
            .send(this.modelCodec);
    }

    search(): Search<T> {
        return new Search<T>(
            this.request,
            this.path,
            this.getSearchParameters(),
            this.modelCodec,
            this.searchPageSize,
            this.searchPageQueryParam
        );
    }

}

