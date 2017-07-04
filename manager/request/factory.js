"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("caesium-core/lang");
const codec_1 = require("caesium-core/codec");
const get_1 = require("./get");
const put_1 = require("./put");
const post_1 = require("./post");
const delete_1 = require("./delete");
class RequestFactory {
    constructor(http, modelMetadata) {
        this.http = http;
        this.modelMetadata = modelMetadata;
    }
    get(endpoint, withCredentials) {
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new get_1.Get(this.http, this.modelMetadata.kind, endpoint, withCredentials);
    }
    put(endpoint, bodyEncoder, withCredentials) {
        var encoder = this.getEncoder(bodyEncoder);
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new put_1.Put(this.http, this.modelMetadata.kind, endpoint, encoder, withCredentials);
    }
    post(endpoint, bodyEncoder, withCredentials) {
        var encoder = this.getEncoder(bodyEncoder);
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new post_1.Post(this.http, this.modelMetadata.kind, endpoint, encoder, withCredentials);
    }
    delete(endpoint, withCredentials) {
        withCredentials = this.withCredentialsDefault(withCredentials);
        return new delete_1.Delete(this.http, this.modelMetadata.kind, endpoint, withCredentials);
    }
    getEncoder(encoder) {
        if (codec_1.isCodec(encoder)) {
            return codec_1.getEncoder(encoder);
        }
        else {
            return encoder;
        }
    }
    withCredentialsDefault(withCredentials) {
        return lang_1.isBlank(withCredentials) ? true : withCredentials;
    }
}
exports.RequestFactory = RequestFactory;
//# sourceMappingURL=factory.js.map