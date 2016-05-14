import {forEachOwnProperty} from 'caesium-core/lang';
import {isDefined} from 'caesium-core/lang';
import {ModelBase} from './base';
import {ModelMetadata, PropertyMetadata} from './metadata';

export type ModelFactory<T extends ModelBase> = (properties: { [attr: string]: any}) => T;

export interface PropertyMutation {
    property: string;
    value: any;
}

export function createModelFactory<T extends ModelBase>(modelMeta: ModelMetadata): ModelFactory<T> {
    function propertyValue(property: PropertyMetadata, initValue?: any): any {
        if (isDefined(initValue)) {
            return initValue;
        }
        if (isDefined(property.defaultValue)) {
            return property.defaultValue();
        }
        return undefined;
    }

    function create(args: {[attr: string]: any}) {
        forEachOwnProperty(args, (value, key) => modelMeta.checkHasProperty(key));
        var objProperties = modelMeta.properties
            .map((prop) => ({
                enumerable: true,
                writable: false,
                value: propertyValue(prop, args[prop.name])
            }))
            .toObject();
        return Object.create(new (modelMeta.type as any)(), objProperties);
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
    var factory = createModelFactory<T>(modelMeta);

    mutations = mutations || [];
    var mutationMap: {[propName: string]: any} = {};
    mutations.forEach((mutation) => {
        modelMeta.checkHasProperty(mutation.property);
        mutationMap[mutation.property] = mutation.value;
    });

    var propValues = modelMeta.properties
        .map((prop) => {
            var propName = prop.name;
            if (mutationMap[propName]) {
                return mutationMap[propName];
            } else {
                return (model as any)[propName];
            }
        })
        .toObject();
    return factory(propValues);
}
