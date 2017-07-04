"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const metadata_1 = require("./metadata");
function Model(options) {
    return function (type) {
        let ownProperties = getOwnModelProperties(type);
        let metadata = new metadata_1.ModelMetadata(type, ownProperties, options);
        type.__model_metadata__ = metadata;
        return type;
    };
}
exports.Model = Model;
function Property(options) {
    return function (target, propertyKey) {
        const metadata = new metadata_1.PropertyMetadata(propertyKey, options);
        contributePropertyMetadata(target.constructor, metadata);
    };
}
exports.Property = Property;
function RefProperty(options) {
    return function (target, propertyKey) {
        const metadata = new metadata_1.RefPropertyMetadata(propertyKey, options);
        contributePropertyMetadata(target.constructor, metadata);
    };
}
exports.RefProperty = RefProperty;
function contributePropertyMetadata(type, propertyMetadata) {
    let properties = getOwnModelProperties(type)
        .set(propertyMetadata.name, propertyMetadata);
    setOwnModelProperties(type, properties);
}
function getOwnModelProperties(type) {
    return type.__own_model_properties__ || immutable_1.Map();
}
function setOwnModelProperties(type, properties) {
    type.__own_model_properties__ = properties;
}
//# sourceMappingURL=decorators.js.map