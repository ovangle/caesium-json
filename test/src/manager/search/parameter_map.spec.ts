import {identityConverter} from 'caesium-core/converter';
import {SearchParameterMap} from '../../../../src/manager/search/parameter_map';

function substringRefiner(currentValue: string, prevValue: string): boolean {
    return currentValue.includes(prevValue);
}
export function parameterMapTests() {
    describe('SearchParameterMap', () => {
        it('should be possible to get a parameter definition from the map', () => {
            var paramMap = new SearchParameterMap([{name: 'a', encoder: identityConverter}]);
            expect(paramMap.getParameter('a')).toEqual({name: 'a', encoder: identityConverter});

            // Should error if there is no definition associated with a parameter
            expect(() => paramMap.getParameter('b')).toThrow();
        });

        it('should be possible to get an encoder from a parameter definition', () => {
            var paramMap = new SearchParameterMap([{name: 'a', encoder: identityConverter}]);
            expect(paramMap.getEncoder('a')).toEqual(identityConverter);
        });

        it('should be possible to get the operator from a param definition, or the default if one was not provided', () => {
            var myOperator = (paramValue: any, otherValue: any) => false;

            var paramMap = new SearchParameterMap([
                {name: 'a', encoder: identityConverter, matcher: myOperator},
                {name: 'b', encoder: identityConverter}
            ]);

            expect(paramMap.getMatcher('a')).toBe(myOperator, 'operator for a should be myOperator');
            expect(paramMap.getMatcher('b')).not.toBe(myOperator, 'operator for b should not be myOperator');
            expect(paramMap.getMatcher('b')).not.toBeNull('operator for b should be a default operator');
        });

        it('should be possible to get the operator from a parameter, or a default if one was not provided on the definition', () => {
            var myRefiner = (previousParamValue: any, currentParamValue: any) => previousParamValue === currentParamValue;
            var paramMap = new SearchParameterMap([
                {name: 'a', encoder: identityConverter, refiner: myRefiner},
                {name: 'b', encoder: identityConverter}
            ]);

            expect(paramMap.getRefiner('a')).toBe(myRefiner);
            expect(paramMap.getRefiner('b')).not.toBe(myRefiner);
            expect(paramMap.getRefiner('b')).not.toBeNull();
            expect(paramMap.getRefiner('b')).toBeDefined();

        });

        it('should be possible to get the property accessor from a parameter, or to default to the name', () => {
            var paramMap = new SearchParameterMap([
                {name: 'a', encoder: identityConverter, accessor: (model) => model.prop},
                {name: 'b', encoder: identityConverter}
            ]);

            var instance = {a: 'a', b: 'b', prop: 'prop'};

            expect(paramMap.getPropertyAccessor('a')(instance)).toEqual('prop');
            expect(paramMap.getPropertyAccessor('b')(instance)).toEqual('b');
        });

        it('should be possible to set a value on the map', () => {
            var paramMap = new SearchParameterMap([{name: 'a', encoder: identityConverter}]);
            var mutated = paramMap.set('a', 'hello world');

            expect(paramMap.get('a')).toEqual(undefined);
            expect(mutated.get('a')).toEqual('hello world');

            // should not touch parameter definitions
            expect(mutated.getParameter('a')).toBe(paramMap.getParameter('a'));
        });

        it('should be possible to encode the parameter values into a string map', () => {
            var paramMap = new SearchParameterMap([
                {name: 'a', encoder: identityConverter},
                {name: 'b', encoder: (_) => 'hello'}
            ]);
            expect(paramMap.valuesToStringMap()).toEqual({});
            paramMap = paramMap.set('a', 'hello');
            paramMap = paramMap.set('b', 'goodbye');

            expect(paramMap.valuesToStringMap()).toEqual({a: 'hello', b: 'hello'});
        });

        it('should be possible to check whether an object matches a parameter map', () => {
            var paramMap = new SearchParameterMap([
                {name: 'a', encoder: identityConverter, matcher: substringRefiner},
                {name: 'b', encoder: identityConverter, accessor: (model) => model.propName},
                {name: 'c', encoder: identityConverter}
            ]);

            var instance = {a: 'abcdef', b: 'ghijkl', c: 'mnopqr', propName: 'stuvwx', d: 'yz'};

            expect(paramMap.matches(instance)).toBe(true, 'an empty parameter map matches everything');
            paramMap = paramMap.set('a', 'abcdefghi');
            expect(paramMap.matches(instance)).toBe(false, 'parameter \'a\' is not a substring of the instance value');
            paramMap = paramMap.set('a', 'abc');
            expect(paramMap.matches(instance)).toBe(true, 'parameter \'a\' is a substring of the instance value');


            paramMap = paramMap.set('b', 'ghijkl');
            expect(paramMap.matches(instance)).toBe(false,
                'parameter \'a\' matches, parameter \'b\' equals instance.b'
            );
            paramMap = paramMap.set('b', 'stuvwx');
            expect(paramMap.matches(instance)).toBe(true,
                'parameter \'a\' matches, parameter \'b\' equals instance.propName');

            paramMap = paramMap.set('c', 'mno');
            expect(paramMap.matches(instance)).toEqual(false,
                'parameters \'a\' and \'b\' match, but \'c\' is a substring'
            );
            paramMap = paramMap.set('c', 'mnopqr');
            expect(paramMap.matches(instance)).toEqual(true,
                'parameters \'a\', \'b\' and \'c\' all match');
        });

        it('should be ordered by refinemnet', () => {
            var paramMap = new SearchParameterMap([
                {name: 'a', encoder: identityConverter, refiner: substringRefiner},
                {name: 'b', encoder: identityConverter}
            ]);

            var mutated1 = paramMap.set('a', 'abc');
            var mutated2 = mutated1.set('a', 'abcdef');
            var mutated3 = mutated2.set('a', 'abc');

            expect(mutated3.isRefinementOf(mutated2)).toBe(false, '\'a=abc\' should not refine \'a=abcdef\'');

            // Reflexive
            expect(mutated1.isRefinementOf(mutated1)).toBe(true, '\'a=abc\' should refine \'a=abc\'');

            // Transitive
            expect(mutated2.isRefinementOf(paramMap)).toBe(true, '\'a=abcdef\' should refine \'\'');

            // Antisymmetric
            expect(mutated3.equals(mutated1)).toBe(true, "'a=abc' should equal a=abc");

            var mutated4 = mutated1.set('b', 40);

            expect(mutated4.isRefinementOf(paramMap)).toBe(true, "'a=abc&b=40' should refine ''");
            expect(mutated4.isRefinementOf(mutated3)).toBe(true, "'a=abc&b=40' should refine 'a=abc'");
        });

    });
}

