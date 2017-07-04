"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const response_1 = require("./response");
class Get {
    constructor(http, kind, endpoint, withCredentials) {
        this.http = http;
        this.kind = kind;
        this.endpoint = endpoint;
        this.withCredentials = withCredentials;
    }
    setRequestParameters(params) {
        this.params = params;
    }
    send() {
        var rawResponses = this.http.request({
            method: interfaces_1.RequestMethod.Get,
            kind: this.kind,
            endpoint: this.endpoint,
            params: this.params,
            withCredentials: this.withCredentials
        });
        return new response_1._ObjectResponseImpl(this, rawResponses);
    }
    toString() {
        return `GET ${this.kind}.${this.endpoint}`;
    }
}
exports.Get = Get;
//# sourceMappingURL=get.js.map