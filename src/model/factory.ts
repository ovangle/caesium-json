import {Map} from 'immutable';

import {forEachOwnProperty, isDefined, isFunction, Type} from 'caesium-core/lang';
import {PropertyNotFoundException, InvalidMetadata} from './exceptions';

import {ModelBase} from './base';
import {ModelValues, initialModelValues, mutateModelValues} from "./values";
import {ModelMetadata} from './metadata';


export type ModelFactory<T extends ModelBase> = (properties: {[prop: string]: any}) => T;
export interface ModelConstructor<T extends ModelBase> extends Function {
    new (...args: any[]): T;
}

export function createModelFactory<T extends ModelBase>(objOrType: Type | T): ModelFactory<T> {
    if (!isFunction(objOrType)) {
        let obj: T = <T>objOrType;
        return (properties: {[prop: string]: any}) => copyModel<T>(obj, properties);
    }
    let type: Type = <Type>objOrType;
    /// The function here might be called before ModelMetadata is available.
    let modelMeta: ModelMetadata = (type as any).__model_metadata__;

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

