import {Map} from 'immutable';

export interface ModelValues {
    initialValues: Map<string,any>;
    values: Map<string,any>;
}

export type ValueAccessor = (modelValues: ModelValues) => any;

export type ValueMutator = (modelValues: ModelValues, value: any) => ModelValues;

