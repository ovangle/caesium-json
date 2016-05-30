import {Observable} from 'rxjs/Observable';
import {isDefined} from 'caesium-core/lang';

import {ModelMetadata, BasePropertyMetadata, RefPropertyMetadata} from './metadata';
import {ManagerBase} from '../manager';

import {copyModel} from './factory';
import {ModelValues} from './values';

import {PropertyNotFoundException} from '../exceptions';

export abstract class ModelBase {
    /**
     * The server-assigned id of the model.
     */
    id: any;

    private __metadata: ModelMetadata;
    private __modelValues: ModelValues;

    /**
     * Get the value of the property `name`.
     * @param propNameOrRefName
     */
    get(propNameOrRefName: string): any {
        var property = this.__metadata.properties.get(propNameOrRefName);
        if (isDefined(property)) {
            return property.valueAccessor(this.__modelValues);
        } else {
            // We are accessing a @RefProperty by the refName
            var propName = this.__metadata.refNameMap.get(propNameOrRefName);
            var refProperty = this.__metadata.properties.get(propName) as RefPropertyMetadata;

            if (!isDefined(refProperty))
                throw new PropertyNotFoundException(propName, this);

            return refProperty.refValueAccessor(this.__modelValues);
        }
    }

    /**
     * Set the value of the property `name` and return the mutated model.
     *
     * @param propNameOrRefName
     * @param value
     */
    set(propNameOrRefName: string, value: any): ModelBase /* typeof this */{
        var property = this.__metadata.properties.get(propNameOrRefName);
        var updatedModelValues: ModelValues;
        if (isDefined(property)) {
            updatedModelValues = property.valueMutator(this.__modelValues, value);
        } else {
            // We are setting the value of the reference
            var propName = this.__metadata.refNameMap.get(propNameOrRefName);
            var refProperty = this.__metadata.properties.get(propName) as RefPropertyMetadata;
            if (!isDefined(refProperty))
                throw new PropertyNotFoundException(propNameOrRefName, this);
            updatedModelValues = refProperty.refValueMutator(this.__modelValues, value);
        }
        return copyModel(this, updatedModelValues);
    }

    /**
     * Check whether the property, given either by it's property name or it's reference property name,
     * has been resolved.
     * @param propNameOrRefName
     * @returns {any}
     */
    isResolved(propNameOrRefName:string):boolean {
        this.__metadata.checkHasPropertyOrRef(propNameOrRefName);
        var property: BasePropertyMetadata = this.__metadata.properties.get(propNameOrRefName);
        if (!isDefined(property)) {
            var propName = this.__metadata.refNameMap.get(propNameOrRefName);
            property = this.__metadata.properties.get(propNameOrRefName);
        }
        return this.__modelValues.resolvedRefs.has(property.name);
    }

    resolveProperty(
        manager:ManagerBase<ModelBase /* typeof this */>,
        propNameOrRefName:string,
        {onNotFound, thisArg}: {onNotFound?:(message:string) => any, thisArg?:any}
    ):Observable<ModelBase /* typeof this */> {
        if (this.isResolved(propNameOrRefName)) {
            return Observable.of(copyModel(this));
        }

        var prop = this.__metadata.properties.get(propNameOrRefName);
        if (!isDefined(prop)) {
            var propName = this.__metadata.refNameMap.get(propNameOrRefName);
            prop = this.__metadata.properties.get(propName);
        }
        if (!isDefined(prop) || !prop.isRef) {
            return Observable.throw(new PropertyNotFoundException(propName, this, 'Reference'));
        }
        var refProp = prop as RefPropertyMetadata;

        var idValue = refProp.valueAccessor(this.__modelValues);

        if (idValue === null) {
            // A null id maps to a null reference.
            return Observable.of(this.set(refProp.refName, null));
        }

        manager.getById(idValue).handle({select: 200, decoder: manager.modelCodec}).subscribe()
    }
}

