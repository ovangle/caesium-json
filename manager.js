"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const http_1 = require("@angular/http");
const model_http_1 = require("./manager/model_http");
const base_1 = require("./manager/base");
var model_http_2 = require("./manager/model_http");
exports.ModelHttp = model_http_2.ModelHttp;
exports.API_HOST_HREF = model_http_2.API_HOST_HREF;
var request_1 = require("./manager/request");
exports.Get = request_1.Get;
exports.Put = request_1.Put;
exports.Post = request_1.Post;
exports.Delete = request_1.Delete;
var search_1 = require("./manager/search");
exports.Search = search_1.Search;
exports.SearchResult = search_1.SearchResult;
exports.SEARCH_PAGE_SIZE = search_1.SEARCH_PAGE_SIZE;
exports.SEARCH_PAGE_QUERY_PARAM = search_1.SEARCH_PAGE_QUERY_PARAM;
var base_2 = require("./manager/base");
exports.ManagerBase = base_2.ManagerBase;
exports.ManagerOptions = base_2.ManagerOptions;
let ManagerModule = class ManagerModule {
};
ManagerModule = __decorate([
    core_1.NgModule({
        imports: [
            http_1.HttpModule
        ],
        providers: [
            model_http_1.ModelHttp,
            base_1.ManagerOptions
        ]
    })
], ManagerModule);
exports.ManagerModule = ManagerModule;
//# sourceMappingURL=manager.js.map