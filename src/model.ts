import {Map, Record} from 'immutable';
import {Type, isBlank} from 'caesium-core/lang';
import {Codec, EncodingException} from 'caesium-core/codec';

import {assertNotNull} from './utils';
import {Json} from './interfaces';
import {str} from './primitives';

export interface ModelType<T extends Model> extends Type<T> {
    new (args: {[k: string]: any}): T;
}

export interface Model {
    get(key: string): any;
}

export interface PropertyOptions {
    required?: boolean;
}
const propertyOptionDefaults = {
    required: true
}


export type Property = Codec<any,Json> | [Codec<any,Json>, PropertyOptions];
function propertyCodec(prop: Property): Codec<any,Json> {
    if (Array.isArray(prop)) {
        return prop[0];
    } else {
        return prop;
    }
}

function propertyOptions(prop: Property): PropertyOptions {
    if (Array.isArray(prop)) {
        return prop[1];
    } else {
        return propertyOptionDefaults;
    }
}


class ModelCodec<T extends Model> implements Codec<T, {[k: string]: any}> {
    constructor(
        public type: ModelType<T>,
        public properties: Map<string,Property>,
        public propKey: Codec<string,string>
    ) {}

    get typeName(): string {
        return this.type.name;
    }

    encode(model: T): {[k: string]: any} {
        assertNotNull(model);
        return this.properties
            .mapEntries(([key,property]) => {
                const options = propertyOptions(property);
                const valueCodec = propertyCodec(property);

                const objKey = this.propKey.encode(key);

                const modelValue = model.get(key);

                if (modelValue === undefined) {
                    if (options.required)
                        throw new EncodingException(`Required property '${key}' of '${this.typeName}' codec not present on model`);
                    return [objKey, undefined];
                }
                return [objKey, valueCodec.encode(modelValue)];
            })
            .filter((v: Json) => v !== undefined)
            .toObject();
    }

    decode(obj: {[k: string]: any}) {
        assertNotNull(obj);

        for (let key of Object.keys(obj)) {
            const modelKey = this.propKey.decode(key);
            if (!this.properties.has(modelKey))
                throw new EncodingException(`'${modelKey}' not found on '${this.typeName}' codec`);
        }

        const modelArgs = this.properties
            .mapEntries(([key, property]) => {
                const options = propertyOptions(property);
                const valueCodec = propertyCodec(property);

                const objKey = this.propKey.encode(key);
                const objValue = obj[objKey];

                if (objValue === undefined) {
                    if (options.required)
                        throw new EncodingException(
                            `Required property '${key}' of '${this.typeName}' codec not present on object`
                        );
                    return [key, undefined];
                }

                return [key, valueCodec.decode(objValue)];
            })
            .filter((v: any) => v !== undefined)
            .toObject();
        return new this.type(modelArgs);
    }
}

export function model<T extends Model>(
    type: ModelType<T>,
    properties: {[prop: string]: Property},
    keyCodec?: Codec<string,string>
): Codec<T,Json> {
    return new ModelCodec(
        type,
        Map<string,Property>(properties),
        keyCodec || str
    );
}

