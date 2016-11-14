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

// A unique token to identify a property that is assigned a reference factory.
export const _DEFERRED_MODEL_FACTORY = <ModelFactory<any>>{};

/**
 * Using a model's declared constructor is cumbersome on anything but
 * the most trivial model definitions.
 *
 * Returns a factory function which accepts a map of property names
 * to their respective types.
 *
 * This function is treated specially to allow for a reference to the
 * containing type to be passed to the factory function.
 *
 * eg.
 * @Model(...)
 * class A {
 *      // You should *never* reference the current type from the body
 *      // of the class except in this particular circumstance.
 *      static create = createModelFactory<A>(A);
 *
 *      // It is fine, however to reference the type from inside a static
 *      // function, so this is OK.
 *      static foo() {
 *          return functionThatAcceptsAModelType(A);
 *      }
 *
 *      constructor(...) {}
 * }
 *
 *
 * @param objOrType
 * @returns {any}
 */
export function createModelFactory<T extends ModelBase>(type: Type): ModelFactory<T> {
    type = resolveForwardRef(type);
    let modelMeta: ModelMetadata = (type as any).__model_metadata__;

    if (!isDefined(modelMeta)) {
        // Metadata might not be available to the
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

