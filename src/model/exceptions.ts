import {Exception} from 'caesium-core/exception';
import {Type} from 'caesium-core/lang';

export class ModelNotFoundException extends Exception {
    constructor(public type: Type<any>) {
        super('The given type was not an @Model annotated instance');
    }
}


export class PropertyNotFoundException extends Exception{
    constructor(propName: string, instance: any, propType?: string) {
        var msg = propType ? `${propType} property ` : 'Property ';
        msg += `'${propName}' is not a property of '${instance}'`;
        super(msg);
    }

    toString() { return `PropertyNotFound: ${this.message}` }
}


export class InvalidMetadata extends Exception {
    toString() { return `InvalidMetadata: ${this.message}` }
}
