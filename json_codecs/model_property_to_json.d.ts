import { Codec } from 'caesium-core/codec';
import { BasePropertyMetadata, RefPropertyMetadata } from '../model/metadata';
export declare class PropertyCodec implements Codec<any, any> {
    metadata: BasePropertyMetadata;
    constructor(metadata: BasePropertyMetadata);
    encode(value: any): any;
    decode(value: any): any;
}
export declare class RefPropertyCodec implements Codec<any, any> {
    metadata: RefPropertyMetadata;
    constructor(metadata: BasePropertyMetadata);
    encode(value: any): any;
    decode(value: any): any;
}
