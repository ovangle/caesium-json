import { List } from 'immutable';
import { Converter } from 'caesium-core/converter';
import { JsonObject } from '../../json_codecs/interfaces';
import { ResponseHandler } from '../request';
import { SearchParameterMap } from './parameter_map';
export interface SearchResultPage<T> {
    parameters: SearchParameterMap;
    items: List<T>;
    isLastPage: boolean;
}
export declare function refinePage<T>(page: SearchResultPage<T>, refinedParams: SearchParameterMap): SearchResultPage<T>;
export declare class SearchResultPageHandler<T> implements ResponseHandler<SearchResultPage<T>> {
    parameters: SearchParameterMap;
    skip: number;
    itemDecoder: Converter<JsonObject, T>;
    select: number;
    constructor(params: SearchParameterMap, itemDecoder: Converter<JsonObject, T>, skip?: number);
    decoder: any;
    decode(obj: JsonObject): SearchResultPage<T>;
}
