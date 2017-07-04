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
require("rxjs/add/operator/map");
const immutable_1 = require("immutable");
const core_1 = require("@angular/core");
const http_1 = require("@angular/http");
const lang_1 = require("caesium-core/lang");
const string_case_converters_1 = require("../json_codecs/string_case_converters");
exports.API_HOST_HREF = new core_1.OpaqueToken('cs_api_host_href');
function stringMapToURLSearchParams(stringMap) {
    var searchParams = new http_1.URLSearchParams();
    lang_1.forEachOwnProperty(stringMap, (value, param) => {
        searchParams.set(string_case_converters_1.camelCaseToSnakeCase(param), value);
    });
    return searchParams;
}
function buildEndpointUrl(apiHostHref, modelKind, endpoint) {
    let kindPath = modelKind.split('::')[0].replace(/\./, '/');
    return `${apiHostHref}/${kindPath}/${endpoint}`;
}
let ModelHttp = class ModelHttp {
    constructor(http, apiHostHref) {
        this.http = http;
        this.apiHostHref = apiHostHref;
    }
    //TODO: Don't use session authentication, use JWT tokens instead.
    _getCSRFToken() {
        var name = 'csrftoken';
        if (document.cookie && document.cookie !== '') {
            var csrfCookie = immutable_1.List(document.cookie.split(';')).valueSeq()
                .map(cookie => cookie.trim())
                .find(cookie => cookie.substring(0, name.length) === name);
            if (csrfCookie !== null) {
                return decodeURIComponent(csrfCookie.substring(name.length + 1));
            }
        }
        return null;
    }
    request(options) {
        var headers = new http_1.Headers();
        headers.set('Content-Type', 'application/json; charset=utf-8');
        headers.set('X-CSRFToken', this._getCSRFToken());
        let request = new http_1.Request(new http_1.RequestOptions({
            method: options.method,
            url: buildEndpointUrl(this.apiHostHref, options.kind, options.endpoint),
            search: stringMapToURLSearchParams(options.params),
            body: lang_1.isDefined(options.body) ? JSON.stringify(options.body) : null,
            headers: headers,
            withCredentials: options.withCredentials
        }));
        return this.http.request(request)
            .map((response) => {
            if (options.isEmptyResponse) {
                return void 0;
            }
            return {
                status: response.status,
                body: response.json()
            };
        });
    }
};
ModelHttp = __decorate([
    core_1.Injectable(),
    __param(1, core_1.Inject(exports.API_HOST_HREF)),
    __metadata("design:paramtypes", [http_1.Http, String])
], ModelHttp);
exports.ModelHttp = ModelHttp;
//# sourceMappingURL=model_http.js.map