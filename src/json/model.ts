import {Map, Record} from 'immutable';

import {Codec} from '../codec';
import {assertNotNull} from '../utils';
import {Json} from './interfaces';
import {str} from './primitives';

export interface PropertyOptions {
    required?: boolean;
}
const propertyOptionDefaults = {
    required: true
}

export type Property = Codec<any,Json> | [Codec<any,Json>, PropertyOptions];
function propertyCodec<K>(prop: Property): Codec<any,Json> {
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

export interface ModelFactory<TProps, U extends Record<TProps>> {
  name?: string;
  new (props: Partial<TProps>): U;
}


class ModelCodec<TProps, TModel extends Record<TProps>> implements Codec<TModel, {[k: string]: any}> {
    constructor(
        public type: ModelFactory<TProps, TModel>,
        public properties: Map<keyof TProps, Property>,
        public propKey: Codec<string,string>
    ) {}

    get typeName(): string {
        return this.type.name;
    }

    encode(model: TModel): {[k: string]: any} {
        assertNotNull(model);
        return this.properties
            .mapEntries(([key,property]) => {
                const options = propertyOptions(property);
                const valueCodec = propertyCodec(property);

                const objKey = this.propKey.encode(key);
                const modelValue = model.get(key, undefined);

                if (modelValue === undefined) {
                    if (options.required)
                        throw new Error(`Required property '${key}' of '${this.typeName}' codec not present on model`);
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
            if (!this.properties.has(<keyof TProps>modelKey))
                throw new Error(`'${modelKey}' not found on '${this.typeName}' codec`);
        }

        const modelArgs = this.properties
            .mapEntries(([key, property]) => {
                const options = propertyOptions(property);
                const valueCodec = propertyCodec(property);

                const objKey = this.propKey.encode(key);
                const objValue = obj[objKey];

                if (objValue === undefined) {
                    if (options.required)
                        throw new Error(
                            `Required property '${key}' of '${this.typeName}' codec not present on object`
                        );
                    return [key, undefined];
                }

                return [key, valueCodec.decode(objValue)];
            })
            .filter((v: any) => v !== undefined)
            .toObject();
        return new this.type(<Partial<TProps>>modelArgs);
    }
}

export function model<TProps, TModel extends Record<TProps>>(
    type: ModelFactory<TProps, TModel>,
    properties: Partial<{[K in keyof TProps]: Property}>,
    keyCodec?: Codec<string,string>
): Codec<TModel,Json> {
    return new ModelCodec(
      type,
      Map(properties) as Map<keyof TProps, Property>,
      keyCodec || str
    );
}

