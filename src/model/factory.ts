import {Map} from 'immutable';

import {forEachOwnProperty, isDefined} from 'caesium-core/lang';
import {ModelBase} from './base';
import {ModelMetadata, RefPropertyMetadata} from './metadata';
import {ModelValues} from "./values";

export type ModelFactory<T extends ModelBase> = (properties: { [attr: string]: any}) => T;

export interface PropertyMutation {
    /*
     * The property (or reference) name that is being mutated
     */
    propName: string;
    /**
     * The new value of the property/reference.
     */
    value: any;
}

export function createModelFactory<T extends ModelBase>(modelMeta: ModelMetadata): ModelFactory<T> {
    function create(args: {[attr: string]: any}) {
        var modelValues = _asMutableModelValues(_initModelValues());
        forEachOwnProperty(args, (value, key) => modelMeta.checkHasPropertyOrRef(key));

        modelMeta.properties.forEach((prop) => {
            modelValues = prop.valueInitializer(modelValues, args[prop.name]);
            if (prop.isRef) {
                var refProp = prop as RefPropertyMetadata;
                modelValues = refProp.refValueInitializer(modelValues, args[refProp.refName]);
            }
        });
        return _createModel(modelMeta, _asImmutableModelValues(modelValues));
    }

    return create;
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
    mutations?: PropertyMutation[] | ModelValues
): T {
    var modelMeta = ModelMetadata.forInstance(model);
    if (!isDefined(mutations)) {
        return _createModel(modelMeta, (model as any).__modelValues);
    }

    if (!Array.isArray(mutations)) {
        return _createModel(modelMeta, mutations as ModelValues);
    }
    var modelValues = _asMutableModelValues((model as any).__modelValues);

    var propMutations = mutations as PropertyMutation[];

    propMutations.forEach((mutation) => {
        var property = modelMeta.properties.get(mutation.propName);
        if (isDefined(property)) {
            modelValues = property.valueMutator(modelValues, mutation.value);
        } else {
            // The property is a RefProperty.
            var propName = modelMeta.refNameMap.get(mutation.propName);
            var refProperty = modelMeta.properties.get(propName) as RefPropertyMetadata;
            modelValues = refProperty.refValueMutator(modelValues, mutation.value);
        }
    });

    return _createModel(modelMeta, _asImmutableModelValues(modelValues));
}

function _createModel(modelMeta: ModelMetadata, modelValues?: ModelValues) {
    modelValues = modelValues || _initModelValues();
    var descriptors: PropertyDescriptorMap = {};

    descriptors['__metadata'] = {enumerable: false, writable: false, value: modelMeta};
    descriptors['__modelValues'] = {enumerable: false, writable: false, value: modelValues};

    modelMeta.properties.forEach((prop) => {
        descriptors[prop.name] = {
            enumerable: true,
            get: function() { return this.get(prop.name); }
        };
        if (prop.isRef) {
            var refName = (prop as RefPropertyMetadata).refName;
            descriptors[refName] = {
                enumerable: true,
                get: function() { return this.get(refName)}
            }
        }
    });

    return Object.create(new (modelMeta.type as any)(), descriptors);
}

function _initModelValues(): ModelValues {
    return {
        initialValues: Map<string,any>(),
        values: Map<string,any>(),
        resolvedRefs: Map<string,any>()
    };
}

function _asMutableModelValues(modelValues: ModelValues): ModelValues {
    return {
        initialValues: modelValues.initialValues.asMutable(),
        values: modelValues.values.asMutable(),
        resolvedRefs: modelValues.resolvedRefs.asMutable()
    };
}

function _asImmutableModelValues(modelValues: ModelValues): ModelValues {
    return {
        initialValues: modelValues.initialValues.asImmutable(),
        values: modelValues.values.asImmutable(),
        resolvedRefs: modelValues.resolvedRefs.asImmutable()
    };
}
