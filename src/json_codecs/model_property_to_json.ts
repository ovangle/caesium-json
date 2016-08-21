import {isDefined, isBlank} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';

import {EncodingException, ArgumentError} from '../exceptions';
import {BasePropertyMetadata, RefPropertyMetadata} from '../model/metadata';

import {model} from './model_to_json';

export class PropertyCodec implements Codec<any,any> {
    metadata: BasePropertyMetadata;

    constructor(metadata: BasePropertyMetadata) {
        this.metadata = metadata;
    }

    encode(value: any): any {
        //TODO: Checking metadata restrictions should be moved to the property accessor/mutator.
        // (that way we can always guarantee them correct, instead of only ensuring they're correct on serialization).
        if (this.metadata.readOnly) {
            // read-only properties should not be on records sent to the server
            // although they may still have a value if we fetched the model.
            return undefined;
        }

        if (this.metadata.required && !isDefined(value)) {
            throw new EncodingException(`No value for required property ${this.metadata.name}`);
        }

        if (!this.metadata.allowNull && value === null) {
            throw new EncodingException(`Property ${this.metadata.name} cannot be null`);
        }
        return this.metadata.codec.encode(value);
    }

    decode(value: any): any {
        if (this.metadata.writeOnly && isDefined(value)) {
            throw new EncodingException(`value for write-only object provided by server`);
        }
        return this.metadata.codec.decode(value);
    }
}

export class RefPropertyCodec implements Codec<any,any> {
    metadata: RefPropertyMetadata;

    constructor(metadata: BasePropertyMetadata) {
        this.metadata = <RefPropertyMetadata>metadata;
    }

    encode(value: any): any {
        // When encoding a reference value, the idProperty (if defined) is already encoded
        // via the PropertyCodec associated with the property's propName.
        // Just ignore the value.
        return undefined;
    }
    decode(value: any): any {
        if (isBlank(value))
            return value;
        // However, when decoding, it is possible for the server to send us either:
        // - just the propertyId; or
        // - A serialized instance of the model.
        // To account for the latter case, we decode the property value as a model
        return model(this.metadata.refType).decode(value);
    }
}
