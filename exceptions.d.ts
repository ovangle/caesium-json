export declare class BaseException extends Error {
    message: any;
    constructor(message: any);
    toString(): any;
}
export declare class ArgumentError extends BaseException {
    toString(): string;
}
export declare class EncodingException extends BaseException {
    toString(): string;
}
export declare class InvalidMetadata extends BaseException {
    toString(): string;
}
export declare class PropertyNotFoundException extends BaseException {
    constructor(propName: string, instance: any, propType?: string);
    toString(): string;
}
export declare class NotSupportedError extends BaseException {
    toString(): string;
}
export declare class StateException extends BaseException {
    toString(): string;
}
export declare class ModelResolutionError extends BaseException {
    toString(): string;
}
export declare class FactoryException extends BaseException {
    toString(): string;
}
