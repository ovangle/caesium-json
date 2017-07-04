"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../../exceptions");
function refinePage(page, refinedParams) {
    if (page.parameters.equals(refinedParams)) {
        // No refinement necessary
        return page;
    }
    if (!refinedParams.isRefinementOf(page.parameters)) {
        throw new exceptions_1.ArgumentError('parameters must be a proper refinement of the page params');
    }
    var items = page.items
        .filter((item) => refinedParams.matches(item))
        .toList();
    return {
        parameters: refinedParams,
        items: items,
        isLastPage: page.isLastPage,
    };
}
exports.refinePage = refinePage;
class SearchResultPageHandler {
    constructor(params, itemDecoder, skip) {
        this.select = 200;
        this.decoder = (this.decode).bind(this);
        this.parameters = params;
        this.itemDecoder = itemDecoder;
        this.skip = skip;
    }
    decode(obj) {
        if (lang_1.isBlank(obj) ||
            !Array.isArray(obj['items']) ||
            !lang_1.isNumber(obj['page_id']) ||
            !lang_1.isBoolean(obj['last_page'])) {
            throw new exceptions_1.EncodingException('Invalid result page: ' + JSON.stringify(obj));
        }
        var responseItems = immutable_1.List(obj['items'])
            .toSeq()
            .map((item) => this.itemDecoder(item))
            .filter((item) => this.parameters.matches(item));
        if (lang_1.isDefined(this.skip) && this.skip > 0) {
            responseItems = responseItems.skip(this.skip);
        }
        return {
            parameters: this.parameters,
            items: responseItems.toList(),
            isLastPage: obj['last_page'],
        };
    }
}
exports.SearchResultPageHandler = SearchResultPageHandler;
//# sourceMappingURL=result_page.js.map