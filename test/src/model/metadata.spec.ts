import {Map} from 'immutable';
import {Type} from 'caesium-core/lang';
import {identity} from 'caesium-core/codec';

import {ModelMetadata, PropertyMetadata} from '../../../src/model/metadata';

export function metadataTests() {
    describe('metadata', () => {
        modelMetadataTests();
        propertyMetadataTests();
    });
}

function _mkModelMetadata(
    kind: string,
    type?: Type,
    properties?: {[name: string]: PropertyMetadata}
) {
    var metadata = new ModelMetadata({kind: kind});
    metadata.contribute(type, Map<string,PropertyMetadata>(properties));
    return metadata;
}

function modelMetadataTests() {
    describe('ModelMetadata', () => {
        it('should throw when trying to create a ModelMetadata with an invalid `kind`', () => {
            expect(() => new ModelMetadata({kind: 'test'})).toThrow();
            expect(() => new ModelMetadata({kind: 'test::MyModel'})).not.toThrow();
        });

        it('should be possible to check whether the model has a given property', () => {
            class Foo {}
            var metadata = _mkModelMetadata('test::MyModel', Foo, {
                'a': new PropertyMetadata({codec: identity})
            });

            expect(() => metadata.checkHasProperty('a')).not.toThrow();
            expect(() => metadata.checkHasProperty('b')).toThrow();
        });
    });
}

function propertyMetadataTests() {
    describe('PropertyMetadata', () => {
        it('should not be possible to contribute a reserved name to a property', () => {
            var property = new PropertyMetadata({codec: identity});
            for (let name of ['kind', 'metadata', 'get', 'set', 'delete']) {
                expect(() => property.contribute(name)).toThrow();
            }
            expect(() => property.contribute('a')).not.toThrow();
        });

        it('should be able to initialize a property', () => {
            var property = new PropertyMetadata({codec: identity, defaultValue: () => false});
            property.name = 'prop';

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>()
            };
            var initializedModelValues = property.valueInitializer(modelValues, undefined);

            expect(initializedModelValues.initialValues.toObject())
                .toEqual({prop: false}, 'should initialize value to property default');
            expect(initializedModelValues.values.toObject())
                .toEqual({}, 'should not alter \'values\'');

            var initializedWithArgs = property.valueInitializer(modelValues, true);
            expect(initializedWithArgs.initialValues.toObject()).toEqual({prop: true},
                'Providing a defined argument to the initializer should override the default'
            );
        });

        it('should be able to mutate a property', () => {
            var property = new PropertyMetadata({codec: identity, defaultValue: () => false});
            property.name = 'prop';

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>()
            };

            var mutatedValues = property.valueMutator(modelValues, true);
            expect(mutatedValues.initialValues.toObject()).toEqual({}, 'should not alter \'initialValues\'');
            expect(mutatedValues.values.toObject()).toEqual({prop: true});
        });


        it('should be able to access property', () => {

            var property = new PropertyMetadata({codec: identity, defaultValue: () => false});
            property.name = 'prop';

            var modelValues = {
                initialValues: Map<string,any>({prop: false}),
                values: Map<string,any>({prop: true})
            };

            expect(property.valueAccessor(modelValues))
                .toBe(true, 'If property present in \'values\' then that value is returned');

            modelValues.values = Map<string,any>();
            expect(property.valueAccessor(modelValues))
                .toBe(false, 'If property not present in \'values\', then the initial value is returned');

        });
    });
}
