"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const lang_1 = require("caesium-core/lang");
const decorators_1 = require("caesium-core/decorators");
const metadata_1 = require("../model/metadata");
const json_codecs_1 = require("../json_codecs");
const model_http_1 = require("./model_http");
const request_1 = require("./request");
const search_1 = require("./search");
const exceptions_1 = require("../exceptions");
/**
 * Rather than expect all manager implementations to declare @Injectable
 * _and_ the correct parameters, this class encapsulates all injectable
 * parameters for the model manager.
 */
let ManagerOptions = ManagerOptions_1 = class ManagerOptions {
    constructor(http, searchPageSize, searchPageQueryParam) {
        this.http = http;
        if (lang_1.isBlank(searchPageSize)) {
            this.searchPageSize = ManagerOptions_1.DefaultSearchPageSize;
        }
        else {
            this.searchPageSize = searchPageSize;
        }
        if (lang_1.isBlank(searchPageQueryParam)) {
            this.searchPageQueryParam = ManagerOptions_1.DefaultSearchPageQueryParam;
        }
        else {
            this.searchPageQueryParam = searchPageQueryParam;
        }
    }
};
ManagerOptions.DefaultSearchPageSize = 20;
ManagerOptions.DefaultSearchPageQueryParam = 'page';
ManagerOptions = ManagerOptions_1 = __decorate([
    core_1.Injectable(),
    __param(1, core_1.Optional()), __param(1, core_1.Inject(search_1.SEARCH_PAGE_SIZE)),
    __param(2, core_1.Optional()), __param(2, core_1.Inject(search_1.SEARCH_PAGE_QUERY_PARAM)),
    __metadata("design:paramtypes", [model_http_1.ModelHttp, Number, String])
], ManagerOptions);
exports.ManagerOptions = ManagerOptions;
class ManagerBase {
    constructor(type, options) {
        this.modelType = type;
        this.http = options.http;
        this._requestFactory = new request_1.RequestFactory(this.http, this.__metadata);
        this.searchPageSize = options.searchPageSize;
        this.searchPageQueryParam = options.searchPageQueryParam;
    }
    get __metadata() {
        return metadata_1.ModelMetadata.forType(this.modelType);
    }
    isManagerFor(type) {
        if (type === this.modelType)
            return true;
        var subtypes = this.getModelSubtypes();
        if (!Array.isArray(subtypes))
            return false;
        return subtypes.some((stype) => stype === type);
    }
    get modelCodec() {
        var modelSubtypes = this.getModelSubtypes();
        if (Array.isArray(modelSubtypes) && modelSubtypes.length > 0) {
            return json_codecs_1.union(...this.getModelSubtypes());
        }
        else if (this.__metadata.isAbstract) {
            throw new exceptions_1.InvalidMetadata('A manager for an abstract model type must provide a nonempty list of subtypes');
        }
        else {
            return json_codecs_1.model(this.modelType);
        }
    }
    getById(id) {
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
    getAllByReference(refName, foreignModel) {
        var request = this._requestFactory.get('');
        request.setRequestParameters({
            [refName]: foreignModel.id.toString()
        });
        return request.send();
    }
    search(parameters) {
        return new search_1.Search(this._requestFactory, parameters, this.modelCodec, this.searchPageSize, this.searchPageQueryParam);
    }
}
__decorate([
    decorators_1.memoize(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ManagerBase.prototype, "modelCodec", null);
exports.ManagerBase = ManagerBase;
var ManagerOptions_1;
//# sourceMappingURL=base.js.map