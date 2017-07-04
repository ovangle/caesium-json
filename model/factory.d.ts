import { Type } from 'caesium-core/lang';
import { ModelBase } from './base';
import { ModelValues } from "./values";
export declare type ModelFactory<T extends ModelBase> = (properties: {
    [attr: string]: any;
}) => T;
export interface PropertyMutation {
    propName: string;
    /**
     * The new value of the property/reference.
     */
    value: any;
}
export declare function modelFactory<T extends ModelBase>(type: Type<T>): ModelFactory<T>;
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
export declare function copyModel<T extends ModelBase>(model: T, mutations?: PropertyMutation[] | ModelValues): T;
