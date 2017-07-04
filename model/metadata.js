"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const core_1 = require("@angular/core");
const lang_1 = require("caesium-core/lang");
const decorators_1 = require("caesium-core/decorators");
const codec_1 = require("caesium-core/codec");
const exceptions_1 = require("../exceptions");
const base_1 = require("./base");
const _VALID_KIND_MATCH = /([a-z](?:\.[a-z])*)::([a-zA-Z]+)/;
function isValidKind(kind) {
    return kind.match(_VALID_KIND_MATCH);
}
exports._RESERVED_PROPERTY_NAMES = immutable_1.Set([
    'metadata',
    'kind',
    'get',
    'set',
    'delete'
]);
class ModelMetadata {
    constructor(type, ownProperties, options) {
        this.type = type;
        this.ownProperties = ownProperties;
        if (!isValidKind(options.kind)) {
            throw new exceptions_1.InvalidMetadata(`Invalid kind '${options.kind}' for model. Kind must match ${_VALID_KIND_MATCH}`);
        }
        this.kind = options.kind;
        if (lang_1.isDefined(options.superType)) {
            var supertypeMeta = ModelMetadata.forType(options.superType);
            if (!supertypeMeta) {
                throw new exceptions_1.InvalidMetadata(`Supertype ${supertypeMeta.kind} must be a model type`);
            }
            if (!supertypeMeta.isAbstract) {
                throw new exceptions_1.InvalidMetadata(`Supertype ${supertypeMeta.kind} must be abstract`);
            }
        }
        this.superType = options.superType || base_1.ModelBase;
        this.isAbstract = !!options.isAbstract;
    }
    static forType(type) {
        const resolvedType = core_1.resolveForwardRef(type);
        const metadata = resolvedType.__model_metadata__;
        if (!metadata) {
            throw `${type} is not an @Model annotated type`;
        }
        return metadata;
    }
    static forInstance(instance) {
        var type = Object.getPrototypeOf(instance).constructor;
        return ModelMetadata.forType(type);
    }
    get supertypeMeta() {
        if (this.superType === base_1.ModelBase)
            return null;
        return ModelMetadata.forType(this.superType);
    }
    checkHasPropertyOrRef(propNameOrRefName) {
        var hasProperty = this.properties.has(propNameOrRefName)
            || this.refNameMap.has(propNameOrRefName);
        if (!hasProperty) {
            throw new exceptions_1.PropertyNotFoundException(propNameOrRefName, this);
        }
    }
    get properties() {
        let supertypeMeta = this.supertypeMeta;
        let superProperties = supertypeMeta
            ? supertypeMeta.properties
            : immutable_1.Map({ id: PropertyMetadata.idProperty(this) });
        return superProperties.merge(this.ownProperties);
    }
    /**
     * A map of refNames to the associated property names.
     * @returns {Map<string, string>}
     */
    get refNameMap() {
        return this.properties
            .filter((prop) => prop.isRef)
            .map((prop) => prop.refName).toKeyedSeq()
            .flip().toMap();
    }
    toString() { return `ModelMetadata(${this.kind})`; }
}
__decorate([
    decorators_1.memoize(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ModelMetadata.prototype, "properties", null);
__decorate([
    decorators_1.memoize(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ModelMetadata.prototype, "refNameMap", null);
exports.ModelMetadata = ModelMetadata;
function _setPropertyOptionDefaults(options) {
    if (lang_1.isBlank(options.readOnly))
        options.readOnly = false;
    if (lang_1.isBlank(options.writeOnly))
        options.writeOnly = false;
    if (lang_1.isBlank(options.required))
        options.required = true;
    if (lang_1.isBlank(options.allowNull))
        options.allowNull = false;
    return options;
}
class BasePropertyMetadata {
    constructor(name, options) {
        options = _setPropertyOptionDefaults(options);
        this.name = name;
        this.readOnly = options.readOnly;
        this.writeOnly = options.writeOnly;
        this.required = options.required;
        this.allowNull = options.allowNull;
    }
    /**
     * Get the value from the model values
     * @param modelValues
     * @returns {any}
     */
    valueAccessor(modelValues) {
        if (modelValues.values.has(this.name)) {
            return modelValues.values.get(this.name);
        }
        else {
            return modelValues.initialValues.get(this.name);
        }
    }
    /**
     * Initialize the value in the modelValues.
     * @param modelValues
     * @param value
     * Contextual information for the initializer
     * @returns {{initialValues: Map<string, any>, values: Map<string, any>}}
     */
    valueInitializer(modelValues, value) {
        var initialValues = modelValues.initialValues;
        if (initialValues.has(this.name))
            throw new exceptions_1.StateException(`Property ${this.name} already initialized`);
        if (lang_1.isDefined(value)) {
            initialValues = initialValues.set(this.name, value);
        }
        else if (lang_1.isDefined(this.defaultValue)) {
            initialValues = modelValues.initialValues.set(this.name, this.defaultValue());
        }
        return {
            initialValues: initialValues,
            values: modelValues.values,
            resolvedRefs: modelValues.resolvedRefs
        };
    }
    /**
     * Mutate the value in the modelValues
     *
     * @param modelValues: The current model state
     * @param value: The new value of the property
     * @param context: Context for the mutator
     * @returns ModelValues: The new model state
     */
    valueMutator(modelValues, value, modelThis) {
        return {
            initialValues: modelValues.initialValues,
            values: modelValues.values.set(this.name, value),
            resolvedRefs: modelValues.resolvedRefs
        };
    }
}
exports.BasePropertyMetadata = BasePropertyMetadata;
/**
 * A [PropertyMetadata] represents a model property with a value type, which is always
 * serialized onto the model.
 */
class PropertyMetadata extends BasePropertyMetadata {
    constructor(name, options) {
        super(name, options);
        this.isRef = false;
        this.isBackRef = false;
        this.defaultValue = options.defaultValue;
        this.codec = options.codec;
    }
    /**
     * All models have an Id property. The id can be any type, as long as the type can be
     * converted using an `identity` codec.
     *
     * 'id' is never a required property, since models need to be created on the client
     * before they can be assigned an 'id'.
     *
     * @returns {PropertyMetadata}
     * @constructor
     */
    static idProperty(modelMetadata) {
        //TODO: id should be a readOnly property
        // At the moment we scrub readOnly properties from the output,
        // which is not the correct thing to do.
        // Instead we should check property restrictions on the mutator/accessor.
        var id = new PropertyMetadata('id', { codec: codec_1.identity, allowNull: true, defaultValue: () => null });
        return id;
    }
}
exports.PropertyMetadata = PropertyMetadata;
/**
 * Check that the value has an `id` property
 * @param value
 * @returns {string}
 * @private
 */
function hasIdProperty(value) {
    return !!(Object.keys(value).find((k) => k === 'id'));
}
/**
 * A [RefProperty] is a property which stores the id of another model.
 *
 * A [RefProperty] is a property associated with another property name
 * on the model. The referenced property name cannot be a property
 * on the model
 *
 * The `value` property must be annotated with `@DoNotSerialize`, and no
 * mutations to the referenced model will be synced to the server when
 * this model is updated.
 */
class RefPropertyMetadata extends BasePropertyMetadata {
    constructor(name, options) {
        super(name, options);
        this.isRef = true;
        this.isBackRef = false;
        this.codec = codec_1.identity;
        this.refName = options.refName;
        if (!lang_1.isDefined(options.refType)) {
            throw new exceptions_1.ArgumentError('Cannot resolve refType. Try a forwardRef');
        }
        this.refType = options.refType;
    }
    valueInitializer(modelValues, value) {
        if (lang_1.isDefined(value) && modelValues.resolvedRefs.has(this.name)) {
            throw new exceptions_1.StateException(`Property ${this.name} already initialized (via ref)`);
        }
        return super.valueInitializer(modelValues, value);
    }
    valueMutator(modelValues, value, modelThis) {
        modelValues = super.valueMutator(modelValues, value, modelThis);
        // Clear the value of any resolved reference.
        // Currently only the id is known.
        return {
            initialValues: modelValues.initialValues,
            values: modelValues.values,
            resolvedRefs: modelValues.resolvedRefs.delete(this.name)
        };
    }
    /**
     * Gets the resolved value of the reference property.
     * Otherwise returns `undefined`.
     * @param modelValues
     * @returns {any}
     */
    refValueAccessor(modelValues) {
        return modelValues.resolvedRefs.get(this.name);
    }
    _setIdValue(values, refValue) {
        return values.set(this.name, lang_1.isBlank(refValue) ? refValue : refValue.id);
    }
    refValueInitializer(modelValues, value) {
        if (!lang_1.isBlank(value) && !hasIdProperty(value)) {
            throw new TypeError('A model reference value must either be `null`, `undefined` or have an `id` property');
        }
        if (lang_1.isDefined(value) && modelValues.initialValues.has(this.name)) {
            throw new exceptions_1.StateException(`Property ${this.name} already initialized (via ref)`);
        }
        if (!lang_1.isDefined(value))
            return modelValues;
        return {
            initialValues: this._setIdValue(modelValues.initialValues, value),
            values: modelValues.values,
            resolvedRefs: modelValues.resolvedRefs.set(this.name, value)
        };
    }
    refValueMutator(modelValues, value, modelThis) {
        if (!lang_1.isBlank(value) && !hasIdProperty(value)) {
            throw new TypeError('A model reference must either be `null`, `undefined` or have an `id` property');
        }
        // Otherwise, directly mutating the reference will also mutate the id.
        return {
            initialValues: modelValues.initialValues,
            values: this._setIdValue(modelValues.values, value),
            resolvedRefs: modelValues.resolvedRefs.set(this.name, value)
        };
    }
}
exports.RefPropertyMetadata = RefPropertyMetadata;
//# sourceMappingURL=metadata.js.map