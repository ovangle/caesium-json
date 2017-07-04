"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/map");
require("rxjs/add/operator/filter");
require("rxjs/add/operator/publish");
const immutable_1 = require("immutable");
const codec_1 = require("caesium-core/codec");
/**
 * The implementation class for all responses which contain a single
 * json object as the response body (Get, Put, Post)
 */
class _ObjectResponseImpl {
    constructor(request, _rawResponses) {
        this.request = request;
        this._rawResponses = _rawResponses.publish();
        this._handledStatuses = immutable_1.Set();
        this._rawResponseSubscription = this._rawResponses.connect();
    }
    get unhandled() {
        return this._rawResponses
            .filter((response) => !this._handledStatuses.contains(response.status));
    }
    handle(handler) {
        var decoder;
        if (codec_1.isCodec(handler.decoder)) {
            decoder = codec_1.getDecoder(handler.decoder);
        }
        else {
            decoder = handler.decoder;
        }
        var handleStatuses;
        if (Array.isArray(handler.select)) {
            handleStatuses = immutable_1.Set(handler.select);
        }
        else {
            handleStatuses = immutable_1.Set([handler.select]);
        }
        this._handledStatuses = this._handledStatuses.union(handleStatuses);
        return this._rawResponses
            .filter((response) => handleStatuses.contains(response.status))
            .map((response) => decoder(response.body));
    }
}
exports._ObjectResponseImpl = _ObjectResponseImpl;
//# sourceMappingURL=response.js.map