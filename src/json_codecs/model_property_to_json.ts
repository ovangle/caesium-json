import {isDefined} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';

import {EncodingException} from '../exceptions';
import {PropertyMetadata} from '../model/metadata';

export class PropertyCodec implements Codec<any,any> {
    metadata: PropertyMetadata;

    constructor(metadata: PropertyMetadata) {
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
