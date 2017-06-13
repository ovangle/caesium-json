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
        contributePropertyMetadata(target.constructor, metadata);
    }
}

export function RefProperty<T>(options: RefPropertyOptions): PropertyDecorator {
    return function (target: any, propertyKey: string) {
        const metadata = new RefPropertyMetadata(propertyKey, options);
        contributePropertyMetadata(target.constructor, metadata);
    }
}

function contributePropertyMetadata(type: Type<any>, propertyMetadata: BasePropertyMetadata) {
    let properties = getOwnModelProperties(type)
        .set(propertyMetadata.name, propertyMetadata);
    setOwnModelProperties(type, properties);
}


function getOwnModelProperties(type: any): Map<string,BasePropertyMetadata> {
    return type.__own_model_properties__ || Map();
}

function setOwnModelProperties(type: any, properties: Map<string,BasePropertyMetadata>) {
    type.__own_model_properties__ = properties;
}


