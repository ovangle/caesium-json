"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const response_1 = require("./response");
class Delete {
    constructor(http, kind, endpoint, withCredentials) {
        this.http = http;
        this.kind = kind;
        this.endpoint = endpoint;
        this.withCredentials = withCredentials;
    }
    send() {
        var observable = this.http.request({
            method: interfaces_1.RequestMethod.Delete,
            kind: this.kind,
            endpoint: this.endpoint,
            withCredentials: this.withCredentials,
            isEmptyResponse: true
        });
        return new response_1._ObjectResponseImpl(this, observable);
    }
    toString() {
        return `DELETE ${this.kind}.${this.endpoint}`;
    }
}
exports.Delete = Delete;
//# sourceMappingURL=delete.js.map