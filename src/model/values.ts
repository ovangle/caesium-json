import {Map} from 'immutable';

export interface ModelValues {
    /**
     * Property values, set either as:
     * - arguments to the model factory; or
     * - as default values provided by the property metadata
     */
    initialValues: Map<string,any>;

    /**
     * The current values for the model properties.
     */
    values: Map<string,any>;

    /**
     * Any resolved reference values, keyed by the reference property name
     */
    resolvedRefs: Map<string,any>;
}

