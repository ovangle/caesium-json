import {Observable} from 'rxjs/Observable';
import {List} from 'immutable';
import {isDefined, isBlank} from 'caesium-core/lang';

import {itemList} from '../json_codecs';
import {ModelMetadata, BasePropertyMetadata, RefPropertyMetadata} from './metadata';
import {ManagerBase} from '../manager';

import {copyModel, ModelConstructor} from './factory';
import {initialModelValues, ModelValues, isModelValues} from './values';

import {PropertyNotFoundException, ArgumentError} from '../exceptions';

export class ModelBase {
    /**
     * The server-assigned id of the model.
     */
    id: any;

    // Do we really need to keep the metadata on the model?
    // Seems like it's exposing implementation details.
    private __metadata__: ModelMetadata;
    private __modelValues__: ModelValues;

    private get __constructor__(): ModelConstructor<this> {
        return (this.__metadata__.type as ModelConstructor<this>);
    }

    constructor(id: number, ...args: any[]) {
        // The arguments are passed in internally, ignoring the constructor.
        // The first arg is always Metadata.
        // The second arg is either a ModelValues object, or the value of the ID property
        // If the second arg is not a ModelValues object, the remainding arguments
        // are the model properties, in order of definition.
        this.__metadata__ = id as any;


        if (args.length > 0 && isModelValues(args[0])) {
            this.__modelValues__ = args[0];
        } else {
            if (args.length !== this.__metadata__.properties.count()) {
                throw new ArgumentError('Unexpected number of arguments');
            }

            this.__modelValues__ = this.__metadata__.properties.valueSeq()
                .zip(List<any>(args))
                .reduce<ModelValues>(
                    (modelValues: ModelValues, [prop, value]: any[]) => prop.valueInitializer(modelValues, value, this),
                    Object.assign({}, initialModelValues)
                );
        }
        this.__metadata__.prepareInstance(this);
    }

    /**
     * Get the value of the property `name`.
     * @param propNameOrRefName
     */
    get(propNameOrRefName: string): any {
        var property = this.__metadata__.properties.get(propNameOrRefName);
        if (isDefined(property)) {
            return property.valueAccessor(this.__modelValues__);
        } else {
            // We are accessing a @RefProperty by the refName
            var propName = this.__metadata__.refNameMap.get(propNameOrRefName);
            var refProperty = this.__metadata__.properties.get(propName) as RefPropertyMetadata;

            if (!isDefined(refProperty))
                throw new PropertyNotFoundException(propName, this);

            return refProperty.refValueAccessor(this.__modelValues__);
        }
    }

    /**
     * Set the value of the property `name` and return the mutated model.
     *
     * @param propNameOrRefName
     * @param value
     */
    set(propNameOrRefName: string, value: any): this {
        var property = this.__metadata__.properties.get(propNameOrRefName);
        var updatedModelValues: ModelValues;

        if (isDefined(property)) {
            updatedModelValues = property.valueMutator(this.__modelValues__, value, this);
        } else {
            // We are setting the value of the reference
            var propName = this.__metadata__.refNameMap.get(propNameOrRefName);
            var refProperty = this.__metadata__.properties.get(propName) as RefPropertyMetadata;
            if (!isDefined(refProperty))
                throw new PropertyNotFoundException(propNameOrRefName, this);
            updatedModelValues = refProperty.refValueMutator(this.__modelValues__, value, this);
        }
        return new (this.__metadata__.type as ModelConstructor<this>)(updatedModelValues);
    }

    setAll(values: {[propNameOrRefName: string]: any}): this {
        return copyModel(this, values);
    }

    /** TODO: setAll(values: {[propNameOrRefName: string]: any}): this { */

    /**
     * Check whether the property, given either by it's property name or it's reference property name,
     * has been resolved.
     * @param propNameOrRefName
     * @returns {any}
     */
    isResolved(propNameOrRefName:string):boolean {
        this.__metadata__.checkHasPropertyOrRef(propNameOrRefName);
        var property: BasePropertyMetadata = this.__metadata__.properties.get(propNameOrRefName);
        if (!isDefined(property)) {
            var propName = this.__metadata__.refNameMap.get(propNameOrRefName);
            property = this.__metadata__.properties.get(propName);
        }
        if (!isDefined(property)) {
            throw new PropertyNotFoundException(propNameOrRefName, this);
        }
        return this.__modelValues__.resolvedRefs.has(property.name);
    }

    resolveProperty(
        manager:ManagerBase<ModelBase /* typeof this */>,
        propNameOrRefName:string
    ):Observable<ModelBase /* typeof this */> {
        if (this.isResolved(propNameOrRefName)) {
            return Observable.of(copyModel(this));
        }

        var prop = this.__metadata__.properties.get(propNameOrRefName);

        if (!isDefined(prop)) {
            var propName = this.__metadata__.refNameMap.get(propNameOrRefName);
            prop = this.__metadata__.properties.get(propName);
        }

        if (!isDefined(prop) || !prop.isRef) {
            return Observable.throw(new PropertyNotFoundException(propName, this, 'Reference'));
        }
        var refProp = prop as RefPropertyMetadata;
        var idValue = refProp.valueAccessor(this.__modelValues__);

        if (isBlank(idValue)) {
            // A null id maps to a null reference.
            return Observable.of(this.set(refProp.refName, null));
        }

        //TODO: What about 404 responses?
        return manager.getById(idValue).handle({select: 200, decoder: manager.modelCodec})
            .map((foreignModel) => this._resolveWith(refProp.name, foreignModel));
    }

    /**
     * Resolve the propName with the given value.
     * The propName cannot be a refName
     * @param propName
     * @param model
     * @returns {ModelBase}
     * @private
     */
    private _resolveWith(propName: string, model: ModelBase): ModelBase /* this */ {
        var prop = <RefPropertyMetadata>this.__metadata__.properties.get(propName);
        return this.set(prop.refName, model);
    }
}

