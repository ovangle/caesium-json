"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const Subject_1 = require("rxjs/Subject");
const core_1 = require("@angular/core");
const codec_1 = require("caesium-core/codec");
const result_1 = require("./search/result");
exports.SearchResult = result_1.SearchResult;
const parameter_map_1 = require("./search/parameter_map");
exports.SEARCH_PAGE_SIZE = new core_1.OpaqueToken('cs_search_page_size');
/**
 * The query parameter to set when requesting a particular
 * page of results.
 */
exports.SEARCH_PAGE_QUERY_PARAM = new core_1.OpaqueToken('cs_search_page_query_param');
class Search {
    constructor(requestFactory, parameters, itemDecoder, pageSize, pageQueryParam) {
        this._requestFactory = requestFactory;
        this.pageSize = pageSize;
        this.pageQueryParam = pageQueryParam;
        if (codec_1.isCodec(itemDecoder)) {
            this.itemDecoder = codec_1.getDecoder(itemDecoder);
        }
        else {
            this.itemDecoder = itemDecoder;
        }
        this._resultChange = new Subject_1.Subject();
        this._onReset = new Subject_1.Subject();
        this._parameterDefns = parameters;
        var initialParams = new parameter_map_1.SearchParameterMap(this._parameterDefns);
        this._resultStack = immutable_1.List([
            new result_1.SearchResult(this, initialParams)
        ]);
        this._onReset.next(null);
    }
    /// The active result
    get result() {
        return this._resultStack.last();
    }
    get resultChange() { return this._resultChange; }
    get onReset() { return this._onReset; }
    getParamValue(param, notSetValue) {
        return this.result.parameters.get(param, notSetValue);
    }
    hasParamValue(param) {
        return this.result.parameters.has(param);
    }
    deleteParamValue(param) {
        var params = this.result.parameters.delete(param);
        this._rebuildResponseStack(params);
    }
    setParamValue(param, value) {
        var params = this.result.parameters.set(param, value);
        this._rebuildResponseStack(params);
    }
    dispose() {
        this._resultChange.complete();
        this._onReset.complete();
    }
    _rebuildResponseStack(params) {
        // If the user reverts to a previous parameter state, (say, by deleting some of the input)
        // then we roll back the stack until we find a cached result set that still matches the
        // new input.
        // It is very unlikely that a user will erase some input just to add it back again,
        // but it's not practical to keep the cache around indefinitely
        var keepResponses = this._resultStack
            .takeWhile((result) => params.isRefinementOf(result.parameters))
            .toList();
        if (!keepResponses.last().parameters.equals(params)) {
            var newResponse = keepResponses.last().refine(params);
            keepResponses = keepResponses.push(newResponse);
        }
        this._resultStack = keepResponses;
        this._resultChange.next(keepResponses.last());
    }
    updateResult(result) {
        var resultIndex = this._resultStack.findLastIndex((r) => r.parameters.equals(result.parameters));
        if (resultIndex < 0) {
            // The result has been discarded. Don't update the stack.
            return result;
        }
        else if (resultIndex === this._resultStack.count() - 1) {
            if (!this._resultChange.closed) {
                this._resultChange.next(result);
            }
        }
        this._resultStack = this._resultStack.set(resultIndex, result);
        return result;
    }
    reset() {
        return new Search(this._requestFactory, this._parameterDefns, this.itemDecoder, this.pageSize, this.pageQueryParam);
    }
}
exports.Search = Search;
//# sourceMappingURL=search.js.map