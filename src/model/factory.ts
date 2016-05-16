import {Map} from 'immutable';
import {forEachOwnProperty} from 'caesium-core/lang';
import {ModelBase} from './base';
import {ModelMetadata, PropertyMetadata} from './metadata';
import {ModelValues} from "./values";

export type ModelFactory<T extends ModelBase> = (properties: { [attr: string]: any}) => T;

export interface PropertyMutation {
    property: string;
    value: any;
}

export function createModelFactory<T extends ModelBase>(modelMeta: ModelMetadata): ModelFactory<T> {
    function create(args: {[attr: string]: any}) {
        var modelValues = _asMutableModelValues(_initModelValues());
        forEachOwnProperty(args, (value, key) => modelMeta.checkHasProperty(key));

        modelMeta.properties.forEach((prop: PropertyMetadata) => {
            var initializer = prop.valueInitializer;
            modelValues = initializer(modelValues, args[prop.name]);
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
    mutations?: PropertyMutation[]
): T {
    var modelMeta = ModelMetadata.forInstance(model);
    mutations = mutations || [];

    var modelValues = _asMutableModelValues((model as any).__modelValues);

    mutations.forEach((mutation) => {
        modelMeta.checkHasProperty(mutation.property);
        var mutator = modelMeta.propertyMutators.get(mutation.property);
        modelValues = mutator(modelValues, mutation.value);
    });

    return _createModel(modelMeta, _asImmutableModelValues(modelValues));
}

function _createModel(modelMeta: ModelMetadata, modelValues: ModelValues) {
    var descriptors: PropertyDescriptorMap = {};

    descriptors['__metadata'] = {enumerable: false, writable: false, value: modelMeta};
    descriptors['__modelValues'] = {enumerable: false, writable: false, value: modelValues};

    modelMeta.properties.forEach((prop) => {
        descriptors[prop.name] = {
            enumerable: true,
            get: function() { return this.get(prop.name); }
        }
    });

    return Object.create(new (modelMeta.type as any)(), descriptors);
}

function _initModelValues(): ModelValues {
    return {
        initialValues: Map<string,any>(),
        values: Map<string,any>()
    };
}

function _asMutableModelValues(modelValues: ModelValues): ModelValues {
    return {
        initialValues: modelValues.initialValues.asMutable(),
        values: modelValues.values.asMutable()
    };
}

function _asImmutableModelValues(modelValues: ModelValues): ModelValues {
    return {
        initialValues: modelValues.initialValues.asImmutable(),
        values: modelValues.values.asImmutable()
    };
}
