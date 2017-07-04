"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseException extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
    toString() { return this.message; }
}
exports.BaseException = BaseException;
class ArgumentError extends BaseException {
    toString() { return `ArgumentError: ${this.message}`; }
}
exports.ArgumentError = ArgumentError;
class EncodingException extends BaseException {
    toString() { return `EncodingException: ${this.message}`; }
}
exports.EncodingException = EncodingException;
class InvalidMetadata extends BaseException {
    toString() { return `InvalidMetadata: ${this.message}`; }
}
exports.InvalidMetadata = InvalidMetadata;
class PropertyNotFoundException extends BaseException {
    constructor(propName, instance, propType) {
        var msg = propType ? `${propType} property ` : 'Property ';
        msg += `'${propName}' is not a property of '${instance}'`;
        super(msg);
    }
    toString() { return `PropertyNotFound: ${this.message}`; }
}
exports.PropertyNotFoundException = PropertyNotFoundException;
class NotSupportedError extends BaseException {
    toString() { return `NotSupported: ${this.message}`; }
}
exports.NotSupportedError = NotSupportedError;
class StateException extends BaseException {
    toString() { return `StateException: ${this.message}`; }
}
exports.StateException = StateException;
class ModelResolutionError extends BaseException {
    toString() { return `ModelResolutionError: ${this.message}`; }
}
exports.ModelResolutionError = ModelResolutionError;
class FactoryException extends BaseException {
    toString() { return `FactoryException: ${this.message}`; }
}
exports.FactoryException = FactoryException;
//# sourceMappingURL=exceptions.js.map