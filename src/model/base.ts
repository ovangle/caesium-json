import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';


import {Iterable, List} from 'immutable';
import {isDefined, isBlank, forEachOwnProperty} from 'caesium-core/lang';

import {itemList} from '../json_codecs';
import {ModelMetadata, BasePropertyMetadata, RefPropertyMetadata} from './metadata';

import {copyModel, ModelConstructor} from './factory';
import {initialModelValues, ModelValues, isModelValues, mutateModelValues} from './values';

import {PropertyNotFoundException, ArgumentError} from './exceptions';

export class ModelBase {

    // Do we really need to keep the metadata on the model?
    // Seems like it's exposing implementation details.
    private __metadata__: ModelMetadata;
    private __modelValues__: ModelValues;

    private get __constructor__(): ModelConstructor<this> {
        return (this.__metadata__.type as ModelConstructor<this>);
    }

    constructor(...args: any[]) {
        // The arguments are passed in internally from the proxied type, ignoring the constructor.
        // The constructor is typed to satisfy the type checker, no matter
        // The /* true */ signature of the constructor is
        // constructor(
        //      metadata: ModelMetadata,
        //      modelValues: ModelValues | any[],
        // )
        // If modelValues is an Array, it will be the list of arguments
        // passed to the actual constructor
        // Otherwise, it's a ModelValues instance to use as __model_values__.
        if (args.length < 2) {
            // Should never happen
            throw new ArgumentError('Invalid arguments for model constructor')
        }

        this.__metadata__ = args[0] as ModelMetadata;
        this.__metadata__.checkValid();

        let modelArgs = args[1];

        if (modelArgs.length > 0 && isModelValues(modelArgs[0])) {
            this.__modelValues__ = modelArgs[0];
        } else {
            if (modelArgs.length !== this.__metadata__.properties.count()) {
                throw new ArgumentError(`Unexpected number of arguments for ${this.__metadata__.type}`);
            }

            this.__modelValues__ = mutateModelValues(initialModelValues, mutator => {
                this.__metadata__.properties.valueSeq()
                    .zip(List(modelArgs))
                    .forEach(([property, value]) => {
                        property.valueAccessor.set(mutator, value)
                    });
            });
        }
    }

    /**
     * Get the value of the property `name`.
     * @param propNameOrRefName
     */
    get(propNameOrRefName: string): any {
        let property = this.__metadata__.getProperty(propNameOrRefName);

        return property.valueAccessor.get(
            this.__modelValues__,
            propNameOrRefName !== property.name
        );
    }

    /**
     * Set the value of the property `name` and return the mutated model.
     *
     * @param propNameOrRefName
     * @param value
     */
    set(propNameOrRefName: string, value: any): this {
        let property = this.__metadata__.getProperty(propNameOrRefName);
        let modelValues = property.valueAccessor.set(
            this.__modelValues__,
            value,
            propNameOrRefName !== property.name
        );
        if (modelValues === this.__modelValues__) {
            return this; // Unchanged
        }
        return new this.__constructor__(modelValues);
    }

    assign(...values: {[propNameOrRefName: string]: any}[]): this {
        let resultMutation = Object.assign({}, ...values);
        let modelValues = mutateModelValues(this.__modelValues__, modelValues => {
            forEachOwnProperty(resultMutation, (value, propNameOrRefName) => {
                let property = this.__metadata__.getProperty(propNameOrRefName);
                property.valueAccessor.set(
                    modelValues,
                    value,
                    propNameOrRefName !== property.name
                )
            })
        });
        if (modelValues === this.__modelValues__) {
            return this; // Unchanged
        }
        return new this.__constructor__(modelValues);
    }

    /**
     * Determine whether there is a resolved value for the given property
     * @param propNameOrRefName
     */
    isResolved(propNameOrRefName: string): boolean {
        let property = this.__metadata__.getProperty(propNameOrRefName);
        return property.valueAccessor.has(this.__modelValues__, true);
    }

}

