import { Type } from 'caesium-core/lang';
import { Codec } from 'caesium-core/codec';
import { ModelMetadata } from '../model/metadata';
import { ModelBase } from '../model/base';
import { JsonObject } from '../json_codecs';
import { ModelHttp } from './model_http';
import { RequestFactory, Response } from './request';
import { Search, SearchParameter } from './search';
/**
 * Rather than expect all manager implementations to declare @Injectable
 * _and_ the correct parameters, this class encapsulates all injectable
 * parameters for the model manager.
 */
export declare class ManagerOptions {
    static DefaultSearchPageSize: number;
    static DefaultSearchPageQueryParam: string;
    http: ModelHttp;
    searchPageSize: number;
    searchPageQueryParam: string;
    constructor(http: ModelHttp, searchPageSize?: number, searchPageQueryParam?: string);
}
export declare abstract class ManagerBase<T extends ModelBase> {
    http: ModelHttp;
    _requestFactory: RequestFactory;
    searchPageSize: number;
    searchPageQueryParam: string;
    modelType: Type<T>;
    /**
     * Get a list of the proper subtypes of the model.
     */
    abstract getModelSubtypes(): Type<any>[];
    protected readonly __metadata: ModelMetadata<T>;
    constructor(type: Type<T>, options: ManagerOptions);
    isManagerFor(type: Type<any>): boolean;
    readonly modelCodec: Codec<T, JsonObject>;
    getById(id: any): Response;
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
    getAllByReference(refName: string, foreignModel: ModelBase): Response;
    search(parameters: SearchParameter[]): Search<T>;
}
