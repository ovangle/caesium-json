import {List, OrderedMap, Set} from 'immutable';

import {resolveForwardRef} from '@angular/core';
import {isDefined, Type, forEachOwnProperty} from 'caesium-core/lang';
import {ArgumentError} from 'caesium-core/exception';

import {ModelBase} from './base';
import {ModelConstructor, createModelFactory, _DEFERRED_MODEL_FACTORY} from './factory';
import {ModelMetadata, buildModelMetadata} from './metadata';


export interface ModelTypeProxy extends Type<any> {
    ___model_metadata__: ModelMetadata;
}

/// Standard method names of Object.prototype and Function.prototype.
/// These method names should always be passed to the underlying type.
const DO_NOT_INTERCEPT = Set<string | symbol>([
    '__proto__',
    '__noSuchMethod__',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
    'hasOwnProperty',
    'isPrototypeOf',
    'getOwnPropertyDescriptor',
    'hasOwnPropertyDescriptor',
    'propertyIsEnumerable',
    'toSource',
    'toString',
    'watch',
    'unwatch',
    'valueOf',
    'arguments',
    'caller',
    'length',
    'name',
    'displayName',
    'apply',
    'bind',
    'call',
    'isGenerator',
    'toSource'
]);

export class ModelTypeProxyHandler implements ProxyHandler<Type<any>> {
    // A reference to the ModelMetadata of the type.
    private __model_metadata__: ModelMetadata;

    // The prepared prototype of the type.
    private prototype: any;

    construct(type: Type<any>, argArray: any[], receiver: any) {
        let metadata = this.get(type, '__model_metadata__', receiver);

        // See note on ModelBase.constructor
        argArray = [metadata, argArray];

        let obj = Reflect.construct(ModelBase, argArray, receiver);
        return Object.freeze(obj);
    }

    get(type: Type<any>, prop: string | symbol, receiver: any): any {
        if (DO_NOT_INTERCEPT.has(prop)) {
            return (type as any)[prop];
        }

        if (prop === '__model_metadata__' && type.name !== receiver.name) {
            // In statements within the static context of a subtype,
            // the decorators have not been applied to to type yet,
            // so we have no metadata.

            // ES6 classes inherit static methods, but this is obviously
            // the wrong thing to do for the metadata, which applies
            // only to the type it was defined as
            return undefined;
        }

        // Build and cache values for the metadata and prototype for the underlying type.
        if (!isDefined(this.__model_metadata__)) {
            let metadata = buildModelMetadata(type, receiver);
            this.__model_metadata__ = metadata;
            this.prototype = prepareType(type, metadata, receiver);
        }

        switch (prop) {
            case '__model_metadata__':
                return this.__model_metadata__;
            case 'prototype':
                return this.prototype;
            case Symbol.toPrimitive:
                return (hint: string) => {
                    if (hint === 'string')
                        return type.toString();
                    throw new ArgumentError(`Cannot convert '${type}' to primitive type ${hint}`);
                }
        }

        let value = (type as any)[prop];
        if (value === _DEFERRED_MODEL_FACTORY) {
            return createModelFactory(receiver);
        } else {
            return value;
        }
    }
}

function prepareType(type: Type<any>, metadata: ModelMetadata, receiver: any) {
    let prototype = type.prototype;

    // Override the prototype's constructor with the proxy.
    prototype.constructor = receiver;

    // If we have added a static factory to the type, make sure
    // we use it properly.

    // TODO: We need to provide a mechanism for referencing the current type in a static context.
    // This only works in the specific case of a model factory.

    forEachOwnProperty(type, (value, key) => {
        /*
        if (value instanceof DeferredValue) {
            type[key] = (<DeferredValue<any>>value).provideMetadata(metadata);
        }
         */
        if (value === _DEFERRED_MODEL_FACTORY) {
            (type as any)[key] = createModelFactory(receiver);
        }
    });

    let descriptorMap = metadata.ownProperties
        .flatMap(property => property.valueAccessor.descriptors)
        .filter((descriptor: PropertyDescriptor, propOrRef: string) => !prototype.hasOwnProperty(propOrRef));

    return Object.defineProperties(prototype, descriptorMap.toObject());
}

export function modelTypeProxy(type: Type<any>): Type<any> {
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

