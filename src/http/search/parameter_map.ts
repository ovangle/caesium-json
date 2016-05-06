import {forEachOwnProperty} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';

import {SearchParameter, Operator, Refiner} from './parameter';
import {StringMap} from '../../json_codecs/interfaces';

/// The default accessor is to interpret the parameter name as a property name
function _defaultAccessor(propName): (model) => any {
    return (model) => model[propName];
}

/// The default matcher for comparing parameter values is just `===`
function _eqMatcher(modelValue, paramValue) {
    return modelValue === paramValue;
}

export class SearchParameterMap {
    private _parameters: Immutable.Map<string, SearchParameter>;
    private _paramValues: Immutable.Map<string,any>;

    constructor(
        parameters: {[name: string]: SearchParameter} | Immutable.Map<string,SearchParameter>,
        paramValues?: Immutable.Map<string,any>
    ) {
        if (parameters instanceof Immutable.Map) {
            this._parameters = parameters as Immutable.Map<string,SearchParameter>;
        } else {
            this._parameters = Immutable.Map<string, SearchParameter>(parameters);
        }

        this._paramValues = paramValues || Immutable.Map<string,any>();
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

    getMatcher(paramName: string): Operator {
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

    get(param: string): any {
        return this._paramValues.get(param);
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
            if (!this.has(param))
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
            if (!this.has(paramName))
            // undefined values always refine the map.
                return true;
            if (!other.has(paramName))
                return false;
            var prevValue = other.get(paramName);
            var currValue = this.get(paramName);
            return this.getRefiner(paramName)(prevValue, currValue);
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


