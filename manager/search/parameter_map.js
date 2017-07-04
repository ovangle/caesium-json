"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../../exceptions");
/// The default accessor is to interpret the parameter name as a property name
function _defaultAccessor(propName) {
    return (model) => model[propName];
}
/// The default matcher for comparing parameter values is just `===`
function _eqMatcher(modelValue, paramValue) {
    return modelValue === paramValue;
}
class SearchParameterMap {
    constructor(parameters, paramValues) {
        if (Array.isArray(parameters)) {
            this._parameters = immutable_1.Map(parameters.map((param) => [param.name, param]));
        }
        else if (parameters instanceof immutable_1.Map) {
            this._parameters = parameters;
        }
        else {
            throw new exceptions_1.ArgumentError('Invalid parameters: ' + JSON.stringify(parameters));
        }
        this._paramValues = paramValues || immutable_1.Map();
    }
    getParameter(paramName) {
        if (!this._parameters.has(paramName)) {
            throw `Parameter ${paramName} not found in search parameters`;
        }
        return this._parameters.get(paramName);
    }
    getEncoder(paramName) {
        return this.getParameter(paramName).encoder;
    }
    getMatcher(paramName) {
        return this.getParameter(paramName).matcher || _eqMatcher;
    }
    getRefiner(paramName) {
        return this.getParameter(paramName).refiner || this.getMatcher(paramName);
    }
    /// Returns a function which accesses the model value associated with the parameter.
    getPropertyAccessor(paramName) {
        return this.getParameter(paramName).accessor || _defaultAccessor(paramName);
    }
    has(param) {
        return this._paramValues.has(param);
    }
    get(param, notSetValue) {
        return this._paramValues.get(param, notSetValue);
    }
    set(param, value) {
        return new SearchParameterMap(this._parameters, this._paramValues.set(param, value));
    }
    delete(param) {
        return new SearchParameterMap(this._parameters, this._paramValues.delete(param));
    }
    valuesToStringMap() {
        return this._paramValues
            .map((value, param) => this.getEncoder(param)(value))
            .toObject();
    }
    matches(model) {
        return this._parameters.keySeq().every((param) => {
            // All values map against an unset parameter
            if (!this.has(param) || !lang_1.isDefined(this.get(param)))
                return true;
            var modelValue = this.getPropertyAccessor(param)(model);
            var operator = this.getMatcher(param);
            return operator(modelValue, this.get(param));
        });
    }
    equals(other) {
        if (other == null)
            return false;
        if (this === other)
            return true;
        return this._paramValues.equals(other._paramValues);
    }
    isProperRefinementOf(other) {
        return this.isRefinementOf(other) && !this.equals(other);
    }
    isRefinementOf(other) {
        return this._parameters.keySeq().every((paramName) => {
            if (!other.has(paramName) || !lang_1.isDefined(other.get(paramName)))
                // undefined values always refine the map
                return true;
            if (!this.has(paramName) || !lang_1.isDefined(this.get(paramName)))
                return false;
            var prevValue = other.get(paramName);
            var currValue = this.get(paramName);
            return this.getRefiner(paramName)(currValue, prevValue);
        });
    }
    toString() {
        var stringMap = this.valuesToStringMap();
        var str = '';
        lang_1.forEachOwnProperty(stringMap, (paramValue, k) => {
            str += `&${k}=${paramValue}`;
        });
        return str.substr(1);
    }
}
exports.SearchParameterMap = SearchParameterMap;
//# sourceMappingURL=parameter_map.js.map