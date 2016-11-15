import {List} from 'immutable';
import {identityConverter} from 'caesium-core/converter';

import {SearchParameterMap} from '../../../src/manager/search/parameter_map';
import {refinePage, searchResultPageHandler} from "../../../src/manager/search/result_page";


function isSubstring(modelValue: string, paramValue: string) {
    return modelValue.includes(paramValue);
}

const paramMap = new SearchParameterMap([
    {name: 'a', encoder: identityConverter, matcher: isSubstring}
]);

describe('manager.search.result_page', () => {
    describe('refinePage', () => {
        it('should refine the items on a result page', () => {
            var unrefinedPage = {
                parameters: paramMap,
                items: List([{a: 'a'}, {a: 'ab'}, {a: 'abcd'}, {a: 'a'}, {a: 'abc'}]),
                isLastPage: false
            };

            var refinedMap = paramMap.set('a', 'ab');
            var refinedPage = refinePage(unrefinedPage, refinedMap);

            expect(refinedPage.parameters).toEqual(refinedMap);
            expect(refinedPage.items.toArray()).toEqual([{a: 'ab'}, {a: 'abcd'}, {a: 'abc'}]);
            expect(refinedPage.isLastPage).toBe(false);
        });

        it('should error if the parameters are not a refinement of the page parameters', () => {
            var unrefinedPage = {
                parameters: paramMap.set('a', 'ab'),
                items: List([{a: 'a'}, {a: 'ab'}, {a: 'abcd'}, {a: 'a'}, {a: 'abc'}]),
                isLastPage: false
            };

            expect(() => refinePage(unrefinedPage, paramMap)).toThrow();
        });

    });

    describe('SearchResultPageHandler', () => {
        it('should be possible to decode a raw result page', () => {
            var handler = searchResultPageHandler<{a:number}>(
                paramMap,
                identityConverter
            );

            var decoded = handler({
                items: [{a: 1}, {a: 2}, {a: 3}],
                page_id: 1,
                last_page: true
            })
            expect(decoded.parameters).toEqual(paramMap);
            expect(decoded.items.toArray()).toEqual( [{a: 1}, {a: 2}, {a: 3}]);
            expect(decoded.isLastPage).toBe(true);
        });

        it('should use the provided decoder when decoding the page results', () => {
            var handler = searchResultPageHandler<{a:number}>(
                paramMap,
                (obj:{b:number}) => ({a: obj.b})
            );

            var decoded = handler({
                items: [{b: 1}, {b: 2}, {b: 3}],
                page_id: 1,
                last_page: true
            })
            expect(decoded.parameters).toEqual(paramMap);
            expect(decoded.items.toArray()).toEqual([{a: 1}, {a: 2}, {a: 3}]);
            expect(decoded.isLastPage).toBe(true);
        });

        it('should skip any items which are not requested in the page', () => {
            var handler = searchResultPageHandler<{a:number}>(
                paramMap,
                identityConverter,
                2
            );

            var decoded = handler({
                parameters: paramMap,
                items: [{a: 1}, {a: 2}, {a: 3}],
                page_id: 1,
                last_page: true
            });
            expect(decoded.parameters).toEqual(paramMap);
            expect(decoded.items.toArray()).toEqual([{a: 3}]);
            expect(decoded.isLastPage).toBe(true);
        });
    });
});
