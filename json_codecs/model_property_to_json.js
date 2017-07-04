"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../exceptions");
const model_to_json_1 = require("./model_to_json");
class PropertyCodec {
    constructor(metadata) {
        this.metadata = metadata;
    }
    encode(value) {
        //TODO: Checking metadata restrictions should be moved to the property accessor/mutator.
        // (that way we can always guarantee them correct, instead of only ensuring they're correct on serialization).
        if (this.metadata.readOnly) {
            // read-only properties should not be on records sent to the server
            // although they may still have a value if we fetched the model.
            return undefined;
        }
        if (this.metadata.required && !lang_1.isDefined(value)) {
            throw new exceptions_1.EncodingException(`No value for required property ${this.metadata.name}`);
        }
        if (!this.metadata.allowNull && value === null) {
            throw new exceptions_1.EncodingException(`Property ${this.metadata.name} cannot be null`);
        }
        return this.metadata.codec.encode(value);
    }
    decode(value) {
        if (this.metadata.writeOnly && lang_1.isDefined(value)) {
            throw new exceptions_1.EncodingException(`value for write-only object provided by server`);
        }
        return this.metadata.codec.decode(value);
    }
}
exports.PropertyCodec = PropertyCodec;
class RefPropertyCodec {
    constructor(metadata) {
        this.metadata = metadata;
    }
    encode(value) {
        // When encoding a reference value, the idProperty (if defined) is already encoded
        // via the PropertyCodec associated with the property's propName.
        // Just ignore the value.
        return undefined;
    }
    decode(value) {
        if (lang_1.isBlank(value))
            return value;
        // However, when decoding, it is possible for the server to send us either:
        // - just the propertyId; or
        // - A serialized instance of the model.
        // To account for the latter case, we decode the property value as a model
        return model_to_json_1.model(this.metadata.refType).decode(value);
    }
}
exports.RefPropertyCodec = RefPropertyCodec;
//# sourceMappingURL=model_property_to_json.js.map