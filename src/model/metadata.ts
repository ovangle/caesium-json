import {Type, isBlank} from 'caesium-core/lang';
import {memoize} from 'caesium-core/decorators';
import {Codec} from 'caesium-core/codec';

import {InvalidMetadata} from "./../exceptions";
import {modelResolver, managerResolver} from './reflection';
import {ModelBase} from "./base";

const _VALID_KIND_MATCH = /([a-z](?:\.[a-z])*)::([a-zA-Z]+)/;

function isValidKind(kind: string) {
    return kind.match(_VALID_KIND_MATCH);
}

export const _RESERVED_PROPERTY_NAMES = Immutable.List<string>([
    'metadata',
    'kind',
    'get',
    'set',
    'delete'
]);

export class ModelMetadata {
    static forType(type: Type): ModelMetadata {
        return modelResolver.resolve(type);
    }

    static forInstance(instance: any): ModelMetadata {
        var type = Object.getPrototypeOf(instance).constructor;
        return ModelMetadata.forType(type);
    }

    kind: string;

    type: Type;

    /// Basic support for model extensions.
    superType: Type;

    ownProperties: Immutable.Map<string, PropertyMetadata>;


    get properties(): Immutable.Map<string,PropertyMetadata> {
        return this._getProperties();
    }

    get supertypeMeta(): ModelMetadata {
        if (this.superType === ModelBase)
            return null;
        return modelResolver.resolve(this.superType);
    }

    constructor({kind, superType}: {kind: string, superType?: Type}) {
        if (!isValidKind(kind)) {
            throw new InvalidMetadata(`Invalid kind '${kind}' for model. Kind must match ${_VALID_KIND_MATCH}`);
        }
        this.kind = kind;
        this.superType = superType || ModelBase;
    }

    checkHasProperty(propName: string): void {
        if (!this.properties.has(propName)) {
            throw new InvalidMetadata(`Property ${propName} is not a valid property of ${this.type}`);
        }
    }

    contribute(type: Type, ownProperties: Immutable.Map<string,PropertyMetadata>) {
        if (isBlank(type) || type.length > 0)
            throw new InvalidMetadata(`Model ${type} must have a 0-argument constructor`);

        this.type = type;
        this.type.prototype = Object.create(this.superType.prototype);
        this.type.prototype.constructor = this.type;
        this.ownProperties = ownProperties;
    }

    @memoize()
    private _getProperties(): Immutable.Map<string,PropertyMetadata> {
        var supertypeMeta = this.supertypeMeta;
        var superProperties = supertypeMeta
            ? supertypeMeta.properties
            : Immutable.Map<string,PropertyMetadata>();
        return superProperties.merge(this.ownProperties);
    }
}


export class PropertyMetadata {
    /// The name of the property on the model.
    name: string;

    /// A function which provides a default value for the property,
    /// or `null` if the property has no default value
    defaultValue: () => any;

    /// The attribute on the model, in the lowerCamelCase form of the attribute.
    /// Values for the property will be present on the serialized resource under the conversion of this attribute name
    /// to the 'lower_with_underscores' equivalent.
    /// eg. { helloWorld: 'hello world' }  would be serialized as { "hello_world": "hello world" }
    codec: Codec<any,any>;

    /// A readOnly property cannot be written to the server during a create or update
    /// operation.
    /// Any value for this property will be dropped during serialization.
    /// Defaults to `false`.
    readOnly: boolean = false;

    /// The property will never be present on values retrieved from the server,
    /// but can be included when updating values on the server.
    /// default is `false`.
    writeOnly: boolean = false;

    /// The property is required on all create and update requests.
    /// Will raise an error if the value is `undefined`.
    /// Default is `true`.
    required: boolean = true;

    /// `true` if the field accepts `null` or `undefined` values.
    /// Default is `false`.
    allowNull: boolean = false;

    constructor(options: {
        codec: Codec<any,any>,
        defaultValue?: () => any,
        readOnly?: boolean,
        writeOnly?: boolean,
        required?: boolean,
        allowNull?: boolean
    }) {
        this.codec = options.codec;
        this.defaultValue = options.defaultValue;
        if (!isBlank(options.readOnly))
            this.readOnly = options.readOnly;
        if (!isBlank(options.writeOnly))
            this.writeOnly = options.writeOnly;
        if (!isBlank(options.required))
            this.required = options.required;
        if (!isBlank(options.allowNull))
            this.allowNull = options.allowNull;
    }

    contribute(propName: string) {
        var reservedName = _RESERVED_PROPERTY_NAMES.find((name) => propName === name);
        if (reservedName)
            throw new InvalidMetadata(`${reservedName} is a reserved name and cannot be the name of a property`);
        this.name = propName;
    }
}

export class ManagerMetadata {
    static forType(type:Type): ManagerMetadata {
        return managerResolver.resolve(type);
    }
    
    static forInstance(instance: any): ManagerMetadata {
        var type = Object.getPrototypeOf(instance).constructor;
        return ManagerMetadata.forType(type);
    }

    modelType:Type;

    /// The model metadata associated with this manager.
    modelMetadata: ModelMetadata;

    get kind() {
        return this.modelMetadata.kind;
    }

    constructor(modelType:Type) {
        this.modelType = modelType;
        this.modelMetadata = ModelMetadata.forType(this.modelType);
    }
}
