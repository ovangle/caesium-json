import {List} from 'immutable';

import {isBlank, isDefined, isNumber, isBoolean} from 'caesium-core/lang';
import {Converter} from 'caesium-core/converter';
import {ValueError} from 'caesium-core/exception';

import {JsonObject, EncodingException} from '../../json_codecs/index';

import {SearchParameterMap} from './parameter_map';

export interface SearchResultPage<T> {
    parameters: SearchParameterMap

    items: List<T>;
    isLastPage: boolean;
}

export function refinePage<T>(page: SearchResultPage<T>, refinedParams: SearchParameterMap): SearchResultPage<T> {
    if (page.parameters.equals(refinedParams)) {
        // No refinement necessary
        return page;
    }

    if (!refinedParams.isRefinementOf(page.parameters)) {
        throw new ValueError('parameters must be a proper refinement of the page params');
    }
    var items = page.items
        .filter((item) => refinedParams.matches(item))
        .toList();

    return {
        parameters: refinedParams,
        items: items,
        isLastPage: page.isLastPage,
    }
}

export function searchResultPageHandler<T>(
    parameters: SearchParameterMap,
    itemDecoder: Converter<JsonObject,T>,
    skip?: number
): Converter<JsonObject, SearchResultPage<T>> {

    function convert(obj: JsonObject): SearchResultPage<T> {
        if (isBlank(obj) || !Array.isArray(obj['items']) || !isNumber(obj['page_id']) || !isBoolean(obj['last_page'])) {
            throw new EncodingException('Invalid result page: ' + JSON.stringify(obj));
        }

        var responseItems = List<JsonObject>(obj['items'])
            .toSeq()
            .map<T>((item) => itemDecoder(item))
            .filter((item) => parameters.matches(item));

        if (isDefined(skip) && skip > 0) {
            responseItems = responseItems.skip(skip);
        }

        return {
            parameters: parameters,
            items: responseItems.toList(),
            isLastPage: obj['last_page'],
        }
    }

    return convert;
}

