import {Map} from 'immutable';
import {Type} from 'caesium-core/lang';

import {
    ModelMetadata, ModelOptions,
    BasePropertyMetadata,
    PropertyMetadata, PropertyOptions,
    RefPropertyOptions, RefPropertyMetadata
} from './metadata';

export function Model(options: ModelOptions): ClassDecorator {
    return function <T>(type: Type<T>) {
        let ownProperties = getOwnModelProperties(type);
        let metadata = new ModelMetadata(type, ownProperties, options);

        (type as any).__model_metadata__ = metadata;
        return type;
    }
}

export function Property<T>(options: PropertyOptions): PropertyDecorator {
    return function (target: any, propertyKey: string) {
        const metadata = new PropertyMetadata(propertyKey, options);
        contributePropertyMetadata(target, metadata);
    }
}

export function RefProperty<T>(options: RefPropertyOptions): PropertyDecorator {
    return function (target: any, propertyKey: string) {
        const metadata = new RefPropertyMetadata(propertyKey, options);
        contributePropertyMetadata(target, metadata);
    }
}

function contributePropertyMetadata(target: any, propertyMetadata: BasePropertyMetadata) {
    let properties = getOwnModelProperties(target)
        .set(propertyMetadata.name, propertyMetadata);
    setOwnModelProperties(target, properties);
}


function getOwnModelProperties(target: any): Map<string,BasePropertyMetadata> {
    return target.__own_model_properties__ || Map();
}

function setOwnModelProperties(target: any, properties: Map<string,BasePropertyMetadata>) {
    target.__own_model_properties__ = properties;
}


