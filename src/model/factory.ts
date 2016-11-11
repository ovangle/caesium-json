import {Map} from 'immutable';

import {forEachOwnProperty, isDefined, isFunction, Type} from 'caesium-core/lang';
import {FactoryException, PropertyNotFoundException} from '../exceptions';
import {ModelBase} from './base';
import {ModelMetadata, RefPropertyMetadata, BackRefPropertyMetadata} from './metadata';
import {ModelValues} from "./values";


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
    let modelMeta = ModelMetadata.forType(type);

    if (modelMeta.isAbstract) {
        throw new FactoryException(`Cannot create a model factory for abstract type '${modelMeta.kind}'`);
    }

    return function create(args: {[attr: string]: any}) {
        var modelValues = _asMutableModelValues(_initModelValues());
        forEachOwnProperty(args, (value, key) => modelMeta.checkHasPropertyOrRef(key));

        modelMeta.properties.forEach((prop) => {
            modelValues = prop.valueInitializer(modelValues, args[prop.name]);
            if (prop.isRef) {
                var refProp = prop as RefPropertyMetadata;
                modelValues = refProp.refValueInitializer(modelValues, args[refProp.refName]);
            }
        });

        modelValues = _asImmutableModelValues(modelValues);

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
    var modelMeta = ModelMetadata.forInstance(model);
    if (!isDefined(mutations)) {
        // models are immutable, why are we copying it?
        return model;
    }
    if (mutations.some(mut => Array.isArray(mut))) {
        throw 'The ability to pass an array of mutations was removed';
    }
    let result = Object.assign({}, ...mutations);

    var modelValues = _asMutableModelValues((model as any).__modelValues__);

    forEachOwnProperty(result, (value, propNameOrRefName) => {
        var property = modelMeta.properties.get(propNameOrRefName);

        if (isDefined(property)) {
            modelValues = property.valueMutator(modelValues, value, model);
        } else {
            // The property is a RefProperty.
            let propName = modelMeta.refNameMap.get(propNameOrRefName);
            let refName = propNameOrRefName;
            if (!isDefined(refName))
                throw new PropertyNotFoundException(refName, model);
            var refProperty = modelMeta.properties.get(propName) as RefPropertyMetadata;
            modelValues = refProperty.refValueMutator(modelValues, value, model);
        }
    });

    return new (modelMeta.type as ModelConstructor<T>)(_asImmutableModelValues(modelValues));
}

function _initModelValues(): ModelValues {
    return {
        initialValues: Map<string,any>(),
        values: Map<string,any>(),
        resolvedRefs: Map<string,any>(),
    };
}

function _asMutableModelValues(modelValues: ModelValues): ModelValues {
    return {
        initialValues: modelValues.initialValues.asMutable(),
        values: modelValues.values.asMutable(),
        resolvedRefs: modelValues.resolvedRefs.asMutable(),
    };
}

function _asImmutableModelValues(modelValues: ModelValues): ModelValues {
    return {
        initialValues: modelValues.initialValues.asImmutable(),
        values: modelValues.values.asImmutable(),
        resolvedRefs: modelValues.resolvedRefs.asImmutable(),
    };
}
