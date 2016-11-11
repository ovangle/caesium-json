import {Map} from 'immutable';
import {isBlank} from 'caesium-core/lang';
import {ModelMetadata, RefPropertyMetadata, BasePropertyMetadata} from './metadata';

export interface ModelValues {
    initialValues: Map<string,any>;
    values: Map<string,any>;
    resolvedRefs: Map<string,any>;
}

export const initialModelValues: ModelValues = {
    initialValues: Map<string,any>(),
    values: Map<string,any>(),
    resolvedRefs: Map<string,any>()
};

export interface BaseModelValueAccessor<T extends BasePropertyMetadata> {
    property: T;

    get(modelValues: ModelValues): ModelValues;
    set(modelValues: ModelValues, value: any): ModelValues;
    remove(modelValues: ModelValues, value: any): ModelValues;
}

export function isModelValues(obj: any) {
    if (isBlank(obj))
        return false;
    return obj.hasOwnProperty('initialValues')
        && obj.hasOwnProperty('values')
        && obj.hasOwnProperty('resolvedRefs');
}


