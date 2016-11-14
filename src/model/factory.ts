import {Map} from 'immutable';

import {resolveForwardRef} from '@angular/core';

import {forEachOwnProperty, isDefined, isFunction, Type} from 'caesium-core/lang';
import {PropertyNotFoundException, InvalidMetadata} from './exceptions';

import {ModelBase} from './base';
import {ModelValues, initialModelValues, mutateModelValues} from "./values";
import {ModelMetadata, buildModelMetadata} from './metadata';


export type ModelFactory<T extends ModelBase> = (properties: {[prop: string]: any}) => T;
export interface ModelConstructor<T extends ModelBase> extends Function {
    new (...args: any[]): T;
}

export const _DEFERRED_MODEL_FACTORY = <ModelFactory<any>>{};

export function createModelFactory<T extends ModelBase>(objOrType: Type | T): ModelFactory<T> {
    if (!isFunction(objOrType)) {
        let obj: T = <T>objOrType;
        return (properties: {[prop: string]: any}) => copyModel<T>(obj, properties);
    }

    let type: Type = resolveForwardRef(<Type>objOrType);

    let modelMeta: ModelMetadata;
    /// createModelFactory should be the only time we refer to the type in a static context
    /// eg.
    /// class Model extends ModelBase {
    ///   static create = createModelFactory(Model);
    /// }
    ///
    /// This is compiled by typescript into
    /// class Model extends ModelBase {}
    /// Model.create = createModelFactory(Model);
    /// ___decorate(Model, /* omitted */)
    ///
    /// Note that using the metadata within a static method is OK, because '__decorate'
    /// will have been called by the time the function body is executed (and thus references
    /// to the type will return the proxied instance.
    ///
    /// ie. the following would always be valid:
    /// class Model extends ModelBase {
    ///   static create = createModelFactory(Model);
    /// }
    ///
    /// The static method is defined _before_ the  decorator is applied, so we need
    /// to look up the bare type, rather than the type proxy.
    if ('__model_metadata__' in type) {
        // We could also be called before ModelMetadata is actually defined
        modelMeta = (type as any).__model_metadata__;
    } else {
        // Defer the creation of the model factory until the type has been annotated.
        // The real model factory will be provided by the proxy.
        return _DEFERRED_MODEL_FACTORY;
    }

    if (modelMeta.isAbstract) {
        throw new InvalidMetadata(`Cannot create a model factory for abstract type '${modelMeta.kind}'`);
    }

    return function create(args: {[attr: string]: any}) {
        let modelValues = mutateModelValues(initialModelValues, modelValues => {
            forEachOwnProperty(args, (value, propNameOrRefName) => {
                let property = modelMeta.getProperty(propNameOrRefName);
                property.valueAccessor.set(
                    modelValues,
                    value,
                    /* getRef */ propNameOrRefName !== property.name
                );
            });
        });
        return new (type as ModelConstructor<T>)(modelValues);
    }
}

/**
 * Copies the values of all the properties defined on the model
 * to the destination.
 *
 * We assume that the model has no properties other than the
 * ones that are decorated with @Property
 * @param model
 * @param mutations
 * Mutations to apply to the current model value.
 * @returns {any}
 * @private
 */
export function copyModel<T extends ModelBase>(
    model: T,
    ...mutations: {[prop: string]: any}[]
): T {
    //TODO: Remove this useless function.
    return model.assign(...mutations);
}

