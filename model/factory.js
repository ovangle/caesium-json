"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../exceptions");
const metadata_1 = require("./metadata");
function modelFactory(type) {
    let modelMeta = metadata_1.ModelMetadata.forType(type);
    if (modelMeta.isAbstract) {
        throw new exceptions_1.FactoryException(`Cannot create a model factory for abstract type '${modelMeta.kind}'`);
    }
    function create(args) {
        var modelValues = _asMutableModelValues(_initModelValues());
        lang_1.forEachOwnProperty(args, (value, key) => modelMeta.checkHasPropertyOrRef(key));
        modelMeta.properties.forEach((prop) => {
            modelValues = prop.valueInitializer(modelValues, args[prop.name]);
            if (prop.isRef) {
                var refProp = prop;
                modelValues = refProp.refValueInitializer(modelValues, args[refProp.refName]);
            }
        });
        return _createModel(modelMeta, _asImmutableModelValues(modelValues));
    }
    return create;
}
exports.modelFactory = modelFactory;
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
function copyModel(model, mutations) {
    var modelMeta = metadata_1.ModelMetadata.forInstance(model);
    if (!lang_1.isDefined(mutations)) {
        return _createModel(modelMeta, model.__modelValues);
    }
    if (!Array.isArray(mutations)) {
        return _createModel(modelMeta, mutations);
    }
    var modelValues = _asMutableModelValues(model.__modelValues);
    var propMutations = mutations;
    propMutations.forEach((mutation) => {
        var property = modelMeta.properties.get(mutation.propName);
        if (lang_1.isDefined(property)) {
            modelValues = property.valueMutator(modelValues, mutation.value, model);
        }
        else {
            // The property is a RefProperty.
            var propName = modelMeta.refNameMap.get(mutation.propName);
            var refProperty = modelMeta.properties.get(propName);
            modelValues = refProperty.refValueMutator(modelValues, mutation.value, model);
        }
    });
    return _createModel(modelMeta, _asImmutableModelValues(modelValues));
}
exports.copyModel = copyModel;
function _createModel(modelMeta, modelValues) {
    modelValues = modelValues || _initModelValues();
    var descriptors = {};
    descriptors['__metadata'] = { enumerable: false, writable: false, value: modelMeta };
    descriptors['__modelValues'] = { enumerable: false, writable: false, value: modelValues };
    modelMeta.properties.forEach((prop) => {
        descriptors[prop.name] = {
            enumerable: true,
            get: function () { return this.get(prop.name); }
        };
        if (prop.isRef) {
            var refName = prop.refName;
            descriptors[refName] = {
                enumerable: true,
                get: function () { return this.get(refName); }
            };
        }
    });
    return Object.create(new modelMeta.type(), descriptors);
}
function _initModelValues() {
    return {
        initialValues: immutable_1.Map(),
        values: immutable_1.Map(),
        resolvedRefs: immutable_1.Map(),
    };
}
function _asMutableModelValues(modelValues) {
    return {
        initialValues: modelValues.initialValues.asMutable(),
        values: modelValues.values.asMutable(),
        resolvedRefs: modelValues.resolvedRefs.asMutable(),
    };
}
function _asImmutableModelValues(modelValues) {
    return {
        initialValues: modelValues.initialValues.asImmutable(),
        values: modelValues.values.asImmutable(),
        resolvedRefs: modelValues.resolvedRefs.asImmutable(),
    };
}
//# sourceMappingURL=factory.js.map