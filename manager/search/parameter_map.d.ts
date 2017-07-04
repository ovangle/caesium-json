import { Map } from 'immutable';
import { Converter } from 'caesium-core/converter';
import { SearchParameter, Matcher, Refiner } from './parameter';
import { StringMap } from '../../json_codecs/interfaces';
export declare class SearchParameterMap {
    private _parameters;
    private _paramValues;
    constructor(parameters: SearchParameter[] | Map<string, SearchParameter>, paramValues?: Map<string, any>);
    getParameter(paramName: string): SearchParameter;
    getEncoder(paramName: string): Converter<any, string>;
    getMatcher(paramName: string): Matcher;
    getRefiner(paramName: string): Refiner;
    getPropertyAccessor(paramName: string): (model: any) => any;
    has(param: string): boolean;
    get(param: string, notSetValue?: any): any;
    set(param: string, value: any): SearchParameterMap;
    delete(param: string): SearchParameterMap;
    valuesToStringMap(): StringMap;
    matches<T>(model: T): boolean;
    equals(other: SearchParameterMap): boolean;
    isProperRefinementOf(other: SearchParameterMap): boolean;
    isRefinementOf(other: SearchParameterMap): boolean;
    toString(): string;
}
