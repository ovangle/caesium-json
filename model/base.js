"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const lang_1 = require("caesium-core/lang");
const factory_1 = require("./factory");
const exceptions_1 = require("../exceptions");
class ModelBase {
    /**
     * Get the value of the property `name`.
     * @param propNameOrRefName
     */
    get(propNameOrRefName) {
        var property = this.__metadata.properties.get(propNameOrRefName);
        if (lang_1.isDefined(property)) {
            return property.valueAccessor(this.__modelValues);
        }
        else {
            // We are accessing a @RefProperty by the refName
            var propName = this.__metadata.refNameMap.get(propNameOrRefName);
            var refProperty = this.__metadata.properties.get(propName);
            if (!lang_1.isDefined(refProperty))
                throw new exceptions_1.PropertyNotFoundException(propName, this);
            return refProperty.refValueAccessor(this.__modelValues);
        }
    }
    /**
     * Set the value of the property `name` and return the mutated model.
     *
     * @param propNameOrRefName
     * @param value
     */
    set(propNameOrRefName, value) {
        var property = this.__metadata.properties.get(propNameOrRefName);
        var updatedModelValues;
        if (lang_1.isDefined(property)) {
            updatedModelValues = property.valueMutator(this.__modelValues, value, this);
        }
        else {
            // We are setting the value of the reference
            var propName = this.__metadata.refNameMap.get(propNameOrRefName);
            var refProperty = this.__metadata.properties.get(propName);
            if (!lang_1.isDefined(refProperty))
                throw new exceptions_1.PropertyNotFoundException(propNameOrRefName, this);
            updatedModelValues = refProperty.refValueMutator(this.__modelValues, value, this);
        }
        return factory_1.copyModel(this, updatedModelValues);
    }
    /**
     * Check whether the property, given either by it's property name or it's reference property name,
     * has been resolved.
     * @param propNameOrRefName
     * @returns {any}
     */
    isResolved(propNameOrRefName) {
        this.__metadata.checkHasPropertyOrRef(propNameOrRefName);
        var property = this.__metadata.properties.get(propNameOrRefName);
        if (!lang_1.isDefined(property)) {
            var propName = this.__metadata.refNameMap.get(propNameOrRefName);
            property = this.__metadata.properties.get(propName);
        }
        if (!lang_1.isDefined(property)) {
            throw new exceptions_1.PropertyNotFoundException(propNameOrRefName, this);
        }
        return this.__modelValues.resolvedRefs.has(property.name);
    }
    resolveProperty(manager, propNameOrRefName) {
        if (this.isResolved(propNameOrRefName)) {
            return Observable_1.Observable.of(factory_1.copyModel(this));
        }
        let propName = propNameOrRefName;
        let prop = this.__metadata.properties.get(propNameOrRefName);
        if (!lang_1.isDefined(prop)) {
            propName = this.__metadata.refNameMap.get(propNameOrRefName);
            prop = this.__metadata.properties.get(propName);
        }
        if (!lang_1.isDefined(prop) || !prop.isRef) {
            return Observable_1.Observable.throw(new exceptions_1.PropertyNotFoundException(propName, this, 'Reference'));
        }
        let refProp = prop;
        let idValue = refProp.valueAccessor(this.__modelValues);
        if (lang_1.isBlank(idValue)) {
            // A null id maps to a null reference.
            return Observable_1.Observable.of(this.set(refProp.refName, null));
        }
        //TODO: What about 404 responses?
        return manager.getById(idValue).handle({ select: 200, decoder: manager.modelCodec })
            .map((foreignModel) => {
            let prop = this.__metadata.properties.get(propName);
            return this.set(prop.refName, foreignModel);
        });
    }
}
exports.ModelBase = ModelBase;
//# sourceMappingURL=base.js.map