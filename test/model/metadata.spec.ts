import {List, Map} from 'immutable';
import {Type} from 'caesium-core/lang';
import {identity} from 'caesium-core/codec';

import {ModelValues} from '../../src/model/values';
import {Model, Property, RefProperty} from '../../src/model/decorators';
import {ModelBase} from '../../src/model/base';
import {ModelMetadata, PropertyMetadata, RefPropertyMetadata} from '../../src/model/metadata';

import * as Test from './models';

@Model({kind: 'test'})
class Invalid_Kind{}

@Model({kind: 'test::Invalid_PropertyReservedName'})
class Invalid_PropertyReservedName extends ModelBase {
    constructor(
        id: number,
        @Property('get', {codec: identity}) public reservedName: string
    ) {
        super(id, reservedName);
    }
}

@Model({kind:'test::Invalid_UntypedProperty'})
export class Invalid_UntypedProperty extends ModelBase {
    constructor(
        id: number,
        @Property('prop', {codec: identity}) public prop: any
    ) {
        super(id, prop);
    }
}

@Model({kind: 'test::Invalid_RefNameInvalid'})
export class Invalid_RefNameInvalid extends ModelBase {
    constructor(
        id: number,
        @Property('ref', {codec: identity}) public ref: any,
        @RefProperty('refId', {refName: 'ref', refType: Invalid_UntypedProperty}) public refId: any
    ) {
        super(id, ref, refId);
    }
}

describe('model.metadata', () => {
    describe('ModelMetadata', () => {

        it('should be possible to get the Metadata of an model', () => {
            let metadata = ModelMetadata.forType(Test.ModelNoProperties);
            expect(metadata.kind).toEqual('model::ModelNoProperties');
            expect(metadata.isAbstract).toEqual(false);
        });

        it('should throw when trying to create a ModelMetadata with an invalid `kind`', () => {
            expect(() => ModelMetadata.forType(Invalid_Kind)).toThrow();
            expect(() => ModelMetadata.forType(Test.ModelNoProperties)).not.toThrow();
        });

        it('should be possible to check whether the model has a given property', () => {
            let metadata = ModelMetadata.forType(Test.ModelOneProperty);
            expect(() => metadata.checkHasPropertyOrRef('prop')).not.toThrow();
            expect(() => metadata.checkHasPropertyOrRef('noProp')).toThrow();
        });

        it('should be possible to get a name from an associated property name', () => {
            let metadata = ModelMetadata.forType(Test.ModelOneRefProperty);
            expect(metadata.refNameMap.get('prop')).toBe('propId');
        });
    });

    describe('PropertyMetadata', () => {

        it('should not be possible to contribute a reserved name to a property', () => {
            expect(() => ModelMetadata.forType(Invalid_PropertyReservedName)).toThrow();
        });

        it('should not be possible to contribute an untyped property', () => {
            expect(() => ModelMetadata.forType(Invalid_UntypedProperty)).toThrow();
        })

        it('should be able to initialize a property', () => {
            let property = ModelMetadata.forType(Test.ModelOneProperty).properties.get('prop');
            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>()
            };
            var initializedModelValues = property.valueInitializer(modelValues, undefined);

            expect(initializedModelValues.initialValues.toObject())
                .toEqual({prop: null}, 'should initialize value to property default');
            expect(initializedModelValues.values.toObject())
                .toEqual({}, 'should not alter \'values\'');

            var initializedWithArgs = property.valueInitializer(modelValues, true);
            expect(initializedWithArgs.initialValues.toObject()).toEqual({prop: true},
                'Providing a defined argument to the initializer should override the default'
            );
        });

        it('should be able to mutate a property', () => {
            let property = ModelMetadata.forType(Test.ModelOneProperty).properties.get('prop');

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>()
            };

            var mutatedValues = property.valueMutator(modelValues, true, null);
            expect(mutatedValues.initialValues.toObject()).toEqual({}, 'should not alter \'initialValues\'');
            expect(mutatedValues.values.toObject()).toEqual({prop: true});
        });


        it('should be able to access property', () => {

            let property = ModelMetadata.forType(Test.ModelOneProperty).properties.get('prop');

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
            let property = ModelMetadata.forType(Test.ModelOneProperty).properties.get('prop');
            expect(property.readOnly).toBe(false, 'readOnly default set');
            expect(property.writeOnly).toBe(false, 'writeOnly default set');
            expect(property.allowNull).toBe(false, 'allowNull default set');
            expect(property.required).toBe(true, 'required default set');
        });
    });

    describe('RefPropertyMetadata', () => {

        it('should not be possible to contribute to the model if one of the model properties is the referenced property', () => {
            expect(() => ModelMetadata.forType(Invalid_RefNameInvalid)).toThrow();
        });

        it('should have default values for the basic property attributes', () => {
            var property = ModelMetadata.forType(Test.ModelOneProperty).properties.get('prop');
            expect(property.readOnly).toBe(false, 'readOnly default set');
            expect(property.writeOnly).toBe(false, 'writeOnly default set');
            expect(property.allowNull).toBe(false, 'allowNull default set');
            expect(property.required).toBe(true, 'required default set');
        });

        it('should be able to initialize a property reference', () => {
            var property = <RefPropertyMetadata>ModelMetadata.forType(Test.ModelOneRefProperty).properties.get('propId');

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
            let property = <RefPropertyMetadata>ModelMetadata.forType(Test.ModelOneRefProperty).properties.get('propId');

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>({propId: {id: 32}, otherId: {id: 68}})
            };

            var mutatedValues = property.valueMutator(modelValues, 500, null);
            expect(mutatedValues.initialValues.toObject()).toEqual({}, 'should not alter \'initialValues\'');
            expect(mutatedValues.values.toObject()).toEqual({propId: 500});
            expect(mutatedValues.resolvedRefs.toObject())
                .toEqual({otherId: {id: 68}}, 'should clear any value associated with \'propId\'');

        });


        it('should be able to access property reference', () => {
            let property = <RefPropertyMetadata>ModelMetadata.forType(Test.ModelOneRefProperty).properties.get('propId');

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

        //TODO: Test for multi valued properties
        it('should be possible to define a multi-valued refProperty', () => {
            let multiProp = <RefPropertyMetadata>ModelMetadata.forType(Test.OneMultiRefProperty).properties.get('multiPropId');
            expect(multiProp.isMulti).toBe(true);
            // TODO: Need to test mutation and access to property.
        });

        it('should not consider a ref value initialized to `undefined` to be resolved', () => {
            var property = <RefPropertyMetadata>ModelMetadata.forType(Test.ModelOneRefProperty).properties.get('propId');

            var modelValues = {
                initialValues: Map<string,any>(),
                values: Map<string,any>(),
                resolvedRefs: Map<string,any>()
            };

            modelValues = property.refValueInitializer(modelValues, undefined);

            expect(modelValues.resolvedRefs.has('prop')).toBe(false);
        });
    });
});
