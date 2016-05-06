
export class ArgumentError extends Error { }

export class DecoratorError extends Error { }

export class EncodingException extends Error { 
    constructor(public message: any) { 
        super(message);
    }
    
    toString() { return `EncodingException: ${this.message}`; }
} 

export class InvalidMetadata extends Error { }

export class ModelResolutionError extends Error {}

export class ModelMutationException extends Error { }
