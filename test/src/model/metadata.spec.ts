import {Map} from 'immutable';
import {Type} from 'caesium-core/lang';
import {identity} from 'caesium-core/codec';

import {ModelMetadata, PropertyMetadata, RefPropertyMetadata} from '../../../src/model/metadata';

export function metadataTests() {
    describe('metadata', () => {
        modelMetadataTests();
        propertyMetadataTests();
        refPropertyMetadataTests();
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

            expect(() => metadata.checkHasPropertyOrRef('a')).not.toThrow();
            expect(() => metadata.checkHasPropertyOrRef('b')).toThrow();
        });

        it('should be possible to get a name from an associated property name', () => {
            class Foo {}
            var metadata = _mkModelMetadata('test::MyModel', Foo, {
                'refId': new RefPropertyMetadata({refName: 'ref'})
            });

            expect(metadata.refNameMap.get('ref')).toBe('refId');
        });
    });
}

function propertyMetadataTests() {
    describe('PropertyMetadata', () => {
        var modelMeta = new ModelMetadata({kind: 'test::MyModel'});
        it('should not be possible to contribute a reserved name to a property', () => {
            var property = new PropertyMetadata({codec: identity});
            for (let name of ['kind', 'metadata', 'get', 'set', 'delete']) {
                expect(() => property.contribute(modelMeta, name)).toThrow();
            }
            expect(() => property.contribute(modelMeta, 'a')).not.toThrow();
        });

        it('should be able to initialize a property', () => {
            var property = new PropertyMetadata({codec: identity, defaultValue: () => false});
            property.name = 'prop';

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>()
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
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>()
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
                values: Map<string,any>({prop: true}),
                resolvedRefs: Map<string,any>()
            };

            expect(property.valueAccessor(modelValues))
                .toBe(true, 'If property present in \'values\' then that value is returned');

            modelValues.values = Map<string,any>();
            expect(property.valueAccessor(modelValues))
                .toBe(false, 'If property not present in \'values\', then the initial value is returned');

        });

        it('should have default values for the boolean property attributes', () => {
            var property = new PropertyMetadata({codec: identity});
            expect(property.readOnly).toBe(false, 'readOnly default set');
            expect(property.writeOnly).toBe(false, 'writeOnly default set');
            expect(property.allowNull).toBe(false, 'allowNull default set');
            expect(property.required).toBe(true, 'required default set');
        })
    });
}

function refPropertyMetadataTests() {
    describe('RefPropertyMetadata', () => {
        var modelMeta = new ModelMetadata({kind: 'test::MyModel'});

        it('should not be possible to contribute a reserved name to a property', () => {
            var property = new RefPropertyMetadata({refName: 'valueProp'});
            for (let name of ['kind', 'metadata', 'get', 'set', 'delete']) {
                expect(() => property.contribute(modelMeta, name)).toThrow();
            }
            expect(() => property.contribute(modelMeta, 'a')).not.toThrow();
        });

        it('should not be possible to contribute to the model if one of the model properties is the referenced property', () => {
            class Foo {}
            var modelMeta = new ModelMetadata({kind: 'test::MyModel'});
            modelMeta.contribute(Foo, Map({prop: new PropertyMetadata({codec: identity})}));

            var property = new RefPropertyMetadata({refName: 'prop'});
            expect(() => property.contribute(modelMeta, 'propName')).toThrow();
        });

        it('should have default values for the boolean property attributes', () => {
            var property = new PropertyMetadata({codec: identity});
            expect(property.readOnly).toBe(false, 'readOnly default set');
            expect(property.writeOnly).toBe(false, 'writeOnly default set');
            expect(property.allowNull).toBe(false, 'allowNull default set');
            expect(property.required).toBe(true, 'required default set');
        });


        it('should be able to initialize a property reference', () => {
            var property = new RefPropertyMetadata({refName: 'prop'});
            property.name = 'propId';

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>()
            };

            var initializedNoInitialValue = property.valueInitializer(modelValues, undefined);
            expect(initializedNoInitialValue.initialValues.toObject())
                .toEqual({}, 'should initialize value to property default');
            expect(initializedNoInitialValue.values.toObject())
                .toEqual({}, 'should not alter \'values\'');

            var initializedWithArgs = property.valueInitializer(modelValues, 40);
            expect(initializedWithArgs.initialValues.toObject()).toEqual({propId: 40},
                'Providing a defined argument to the initializer should override the default'
            );
            expect(initializedWithArgs.resolvedRefs.toObject())
                .toEqual({}, 'Initializing via id should not touch resolvedRefs');

            var initializedViaRef = property.refValueInitializer(modelValues, {id: 40});
            expect(initializedViaRef.initialValues.toObject())
                .toEqual({propId: 40}, 'Initializing ref should initialize id value');
            expect(initializedViaRef.values.toObject()).toEqual({}, 'initializing ref should not touch values');
            expect(initializedViaRef.resolvedRefs.toObject())
                .toEqual({propId: {id: 40}}, 'Should have set an initial value for ref');



            // Set ref after initializing id
            expect(() => property.refValueInitializer(initializedWithArgs, {id: 400})).toThrow();

            // Set id after initializing ref
            expect(() => property.valueInitializer(initializedViaRef, 400)).toThrow();
        });

        it('should be able to mutate a property reference', () => {
            var property = new RefPropertyMetadata({refName: 'prop'});
            property.name = 'propId';

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>({propId: {id: 32}, otherId: {id: 68}})
            };

            var mutatedValues = property.valueMutator(modelValues, 500);
            expect(mutatedValues.initialValues.toObject()).toEqual({}, 'should not alter \'initialValues\'');
            expect(mutatedValues.values.toObject()).toEqual({propId: 500});
            expect(mutatedValues.resolvedRefs.toObject())
                .toEqual({otherId: {id: 68}}, 'should clear any value associated with \'propId\'');

        });


        it('should be able to access property reference', () => {
            var property = new RefPropertyMetadata({refName: 'prop'});
            property.name = 'propId';

            var modelValues = {
                initialValues: Map<string,any>({propId: 20}),
                values: Map<string,any>({propId: 40}),
                resolvedRefs: Map<string,any>({propId: {id: 500}, prop: {id: 600}})
            };

            expect(property.valueAccessor(modelValues))
                .toBe(40, 'If property present in \'values\' then that value is returned');

            modelValues.values = Map<string,any>();
            expect(property.valueAccessor(modelValues))
                .toBe(20, 'If property not present in \'values\', then the initial value is returned');

            expect(property.refValueAccessor(modelValues))
                .toEqual({id: 500}, 'Should retrieve the value associated with prop.name');

        });
    });
}
