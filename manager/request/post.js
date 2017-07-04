"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("caesium-core/lang");
const interfaces_1 = require("./interfaces");
const exceptions_1 = require("../../exceptions");
const response_1 = require("./response");
class Post {
    constructor(http, kind, endpoint, bodyEncoder, withCredentials) {
        this.kind = kind;
        this.http = http;
        this.endpoint = endpoint;
        this.encoder = bodyEncoder;
        this.withCredentials = withCredentials;
    }
    setRequestBody(body) {
        this.body = body;
        return this;
    }
    send() {
        if (!lang_1.isDefined(this.body))
            throw new exceptions_1.StateException(`${this}: No body set on request`);
        var observable = this.http.request({
            method: interfaces_1.RequestMethod.Post,
            kind: this.kind,
            endpoint: this.endpoint,
            body: this.encoder(this.body),
            withCredentials: this.withCredentials
        });
        return new response_1._ObjectResponseImpl(this, observable);
    }
    toString() {
        return `POST ${this.kind}.${this.endpoint}`;
    }
}
exports.Post = Post;
//# sourceMappingURL=post.js.map