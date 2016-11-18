import {Observable} from 'rxjs/Observable';

import {Injectable, Inject, Optional, Provider, OpaqueToken} from '@angular/core';

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


export interface ManagerConfig {
    /**
     * The type of the model we are providing a manager for.
     */
        type: Type;

    /**
     * The subtypes of the model.
     */
    subtypes?: Type[];
}

export function provideManager(token: string | OpaqueToken, config: ManagerConfig): Provider {
    return {
        provide: token,
        useFactory: (requests: RequestFactory, searchPageSize: number, searchPageQueryParam: string) => {
            return new ModelManager(config.type, config.subtypes || [], requests, searchPageSize, searchPageQueryParam)
        },
        deps: [RequestFactory, SEARCH_PAGE_SIZE, SEARCH_PAGE_QUERY_PARAM]
    };
}


@Injectable()
export class ModelManager<T extends ModelBase> {
    searchPageSize: number;
    searchPageQueryParam: string;

    protected get __metadata__(): ModelMetadata {
        return ModelMetadata.forType(this.type);
    }

    get path(): Array<string> {
        let [path, type] = this.__metadata__.kind.split('::');
        return path.split('.');
    }

    constructor(
        public type: Type,
        public subtypes: Type[],
        public request: RequestFactory,
        @Optional() @Inject(SEARCH_PAGE_SIZE) searchPageSize: number = defaultSearchPageSize,
        @Optional() @Inject(SEARCH_PAGE_QUERY_PARAM) searchPageQueryParam: string = defaultSearchPageQueryParam
    ) {
        this.searchPageSize = isBlank(searchPageSize) ? defaultSearchPageSize : searchPageSize;
        this.searchPageQueryParam = isBlank(searchPageQueryParam) ? defaultSearchPageQueryParam : searchPageQueryParam;
    }


    get modelCodec(): Codec<T,JsonObject> {
        if (this.subtypes.length > 0) {
            return union(...this.subtypes);
        }
        return model<T>(this.type);
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

    search(parameters: SearchParameter[]): Search<T> {
        return new Search<T>(
            this.request,
            this.path,
            parameters,
            this.modelCodec,
            this.searchPageSize,
            this.searchPageQueryParam
        );
    }

}

