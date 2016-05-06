import {Converter} from 'caesium-core/converter';

export type Operator = (modelValue: any, paramValue: any) => boolean;
export type Refiner = (currentParamValue: any, previousParamValue: any) => boolean;

export interface SearchParameter {
    /// Convert the value for this param to a string (for use when encoding urls)
    encoder: Converter<any, string>;

    /// Get the value for this parameter off the model.
    /// If not provided, the search parameter name will be interpreted as a property name;
    accessor?: (model) => any;

    // Compare the model value to parameter value.
    // If not provided, the values will be compared using `===`
    matcher?: Operator;

    /// Test whether the current parameter value is more 'precise' than the previous value.
    ///
    /// Most of the time, the refiner will be the same as the matcher. However, whenever
    /// the parameter is a different type than the model property, they will be different.
    ///
    /// eg. Matching numbers in an interval -- the refiner should return test whether
    /// the previous interval completely contains the current interval, wheras the matcher
    /// would test whether the point lies inside the interval.
    ///
    /// If not provided, defaults to the value of `matcher`.
    refiner?: Refiner;
}
