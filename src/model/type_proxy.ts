import {List, OrderedMap} from 'immutable';

import {resolveForwardRef} from '@angular/core';
import {isDefined, Type} from 'caesium-core/lang';

import {ModelBase} from './base';
import {ModelConstructor} from './factory';
import {ModelMetadata, buildModelMetadata} from './metadata';


export interface ModelTypeProxy extends Type {
    ___model_metadata__: ModelMetadata;
}

export class ModelTypeProxyHandler implements ProxyHandler<Type> {
    private __model_metadata__: ModelMetadata;
    private __prototype__: any;

    construct(type: Type, argArray: any[], receiver: any) {
        let metadata = this.get(type, '__model_metadata__', receiver);
        argArray = [metadata, ...argArray];

        let obj = Reflect.construct(ModelBase, argArray, receiver);
        return Object.freeze(obj);
    }

    has(type: Type, prop: string): boolean {
        if (prop === '__model_metadata__')
            return true;
        return prop in type;
    }

    get(type: Type, prop: string, receiver: any) {
        if (prop === '__model_metadata__' || prop === 'prototype') {
            let metadata = buildModelMetadata(type, receiver);
            this.__model_metadata__ = metadata;
            this.__prototype__ = prepareType(type, metadata);
        }

        switch (prop) {
            case '__model_metadata__':
                return this.__model_metadata__;
            case 'prototype':
                return this.__prototype__;
            default:
                return (type as any)[prop];

        }
    }
}

function prepareType(type: Type, metadata: ModelMetadata) {
    let prototype = type.prototype;

    let descriptorMap = metadata.ownProperties
        .flatMap(property => property.valueAccessor.descriptors);

    return Object.defineProperties(prototype, descriptorMap.toObject());
}

export function modelTypeProxy(type: Type): Type {
    let proxy = new Proxy(type, new ModelTypeProxyHandler());
    // Added just for testing purposes.
    (proxy as any).__type_ref__ = type;
    return proxy;
}

/**
 * Test whether the type is the proxy or not.
 *
 * The proxy won't have a metadata key, because it was keyed to the type
 * before the proxy was created.
 *
 * @param type
 * @returns {boolean}
 */
function isModelType(type: any): boolean {
    return Reflect.hasMetadata('model:options', type);
}

