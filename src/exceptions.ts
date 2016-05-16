export class BaseException extends Error {
    constructor(public message: any) {
        super(message);
    }

    toString() { return this.message }
}

export class ArgumentError extends BaseException {
    toString() { return `ArgumentError: ${this.message}` }
}

export class EncodingException extends BaseException {
    toString() { return `EncodingException: ${this.message}` }
}

export class InvalidMetadata extends BaseException {
    toString() { return `InvalidMetadata: ${this.message}` }
}

export class PropertyNotFoundException extends BaseException {
    constructor(propName: string, instance: any, propType?: string) {
        var msg = propType ? `${propType} property ` : 'Property ';
        msg += `'${propName}' is not a property of '${instance}'`;
        super(msg);
    }

    toString() { return `PropertyNotFound: ${this.message}` }
}

export class StateException extends BaseException {
    toString() { return `StateException: ${this.message}`; }
}

export class ModelResolutionError extends BaseException {
    toString() { return `ModelResolutionError: ${this.message}`}
}

