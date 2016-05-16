
export interface ModelValues {
    initialValues: Immutable.Map<string,any>;
    values: Immutable.Map<string,any>;
}

export type ValueAccessor = (modelValues: ModelValues) => any;

export type ValueMutator = (modelValues: ModelValues, value: any) => ModelValues;

