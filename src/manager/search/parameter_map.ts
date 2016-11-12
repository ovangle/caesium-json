import {Map} from 'immutable';

import {isDefined, forEachOwnProperty} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';

import {ArgumentError} from '../../model/exceptions';

import {SearchParameter, Matcher, Refiner} from './parameter';
import {StringMap} from '../../json_codecs/interfaces';

/// The default accessor is to interpret the parameter name as a property name
function _defaultAccessor(propName: string): (model: any) => any {
    return (model) => model[propName];
}

/// The default matcher for comparing parameter values is just `===`
function _eqMatcher(modelValue: any, paramValue: any) {
    return modelValue === paramValue;
}

export class SearchParameterMap {
    private _parameters: Map<string, SearchParameter>;
    private _paramValues: Map<string,any>;

    constructor(
        parameters: SearchParameter[] | Map<string,SearchParameter>,
        paramValues?: Map<string,any>
    ) {
        if (Array.isArray(parameters)) {
            this._parameters = Map<string,SearchParameter>(parameters.map((param) => [param.name, param]));
        } else if (parameters instanceof Map) {
            this._parameters = parameters as Map<string,SearchParameter>;
        } else {
            throw new ArgumentError('Invalid parameters: ' + JSON.stringify(parameters));
        }

        this._paramValues = paramValues || Map<string,any>();
    }

    getParameter(paramName: string): SearchParameter {
        if (!this._parameters.has(paramName)) {
            throw `Parameter ${paramName} not found in search parameters`;
        }
        return this._parameters.get(paramName);
    }

    getEncoder(paramName: string): Converter<any, string> {
        return this.getParameter(paramName).encoder;
    }

    getMatcher(paramName: string): Matcher {
        return this.getParameter(paramName).matcher || _eqMatcher;
    }

    getRefiner(paramName: string): Refiner {
        return this.getParameter(paramName).refiner || this.getMatcher(paramName);
    }

    /// Returns a function which accesses the model value associated with the parameter.
    getPropertyAccessor(paramName: string): (model: any) => any {
        return this.getParameter(paramName).accessor || _defaultAccessor(paramName);
    }

    has(param: string): boolean {
        return this._paramValues.has(param);
    }

    get(param: string, notSetValue?: any): any {
        return this._paramValues.get(param, notSetValue);
    }

    set(param: string, value: any): SearchParameterMap {
        return new SearchParameterMap(
            this._parameters,
            this._paramValues.set(param, value)
        );
    }

    delete(param: string): SearchParameterMap {
        return new SearchParameterMap(
            this._parameters,
            this._paramValues.delete(param)
        );
    }

    valuesToStringMap(): StringMap {
        return this._paramValues
            .map((value, param) => this.getEncoder(param)(value))
            .toObject();
    }

    matches<T>(model: T): boolean {
        return this._parameters.keySeq().every((param) => {
            // All values map against an unset parameter
            if (!this.has(param) || !isDefined(this.get(param)))
                return true;

            var modelValue = this.getPropertyAccessor(param)(model);
            var operator = this.getMatcher(param);
            return operator(modelValue, this.get(param));
        });
    }

    equals(other: SearchParameterMap) {
        if (other == null)
            return false;
        if (this === other)
            return true;
        return this._paramValues.equals(other._paramValues);
    }

    isProperRefinementOf(other: SearchParameterMap) {
        return this.isRefinementOf(other) && !this.equals(other);
    }

    isRefinementOf(other: SearchParameterMap) {
        return this._parameters.keySeq().every((paramName) => {
            if (!other.has(paramName) || !isDefined(other.get(paramName)))
                // undefined values always refine the map
                return true;
            if (!this.has(paramName) || !isDefined(this.get(paramName)))
                return false;
            var prevValue = other.get(paramName);
            var currValue = this.get(paramName);
            return this.getRefiner(paramName)(currValue, prevValue);
        });
    }

    toString(): string {
        var stringMap = this.valuesToStringMap();
        var str = '';
        forEachOwnProperty(stringMap, (paramValue, k) => {
            str += `&${k}=${paramValue}`;
        });
        return str.substr(1);
    }
}


