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

        it('should be possible to get the Metadata of a model type', () => {
            let metadata = ModelMetadata.forType(Test.ModelNoProperties);
            expect(metadata.kind).toEqual('model::ModelNoProperties');
            expect(metadata.isAbstract).toEqual(false);
        });

        it('should be possible to get the Metadata for a model subtype', () => {
            console.log('SuperType meta', ModelMetadata.forType(Test.ModelSupertype));
            console.log('Subtype meta', ModelMetadata.forType(Test.ModelSubtype));
            let metadata = ModelMetadata.forType(Test.ModelSubtype)
            expect(metadata.kind).toEqual('model::ModelSubtype');
        });

        it('should be possible to get the Metadata for a model instance', () => {
            let m1 = new Test.ModelNoProperties(null);
            expect(ModelMetadata.forInstance(m1)).toBe(ModelMetadata.forType(Test.ModelNoProperties));

            let m2 = new Test.ModelSubtype(null);
            expect(ModelMetadata.forInstance(m2)).toBe(ModelMetadata.forType(Test.ModelSubtype));
        })

        it('should throw when trying to create a ModelMetadata with an invalid `kind`', () => {
            expect(() => ModelMetadata.forType(Invalid_Kind)).toThrow();
            expect(() => ModelMetadata.forType(Test.ModelNoProperties)).not.toThrow();
        });

        it('should be possible to get a name from an associated property name', () => {
            let metadata = ModelMetadata.forType(Test.ModelOneRefProperty);
            expect(metadata.refNameMap.get('prop')).toBe('propId');
        });

        it('should be possible to get the path to a model', () => {
            let modelNoProperties = ModelMetadata.forType(Test.ModelNoProperties);
            expect(modelNoProperties.path).toEqual(['model']);

            let complexPath = ModelMetadata.forType(Test.ComplexPath);
            expect(complexPath.path).toEqual(['model', 'path', 'to', 'resource']);
        });
    });

    describe('PropertyMetadata', () => {

        it('should not be possible to contribute a reserved name to a property', () => {
            expect(() => ModelMetadata.forType(Invalid_PropertyReservedName)).toThrow();
        });

        // Codec is mandatory at the moment, so it doesn't matter if properties are untyped
        xit('should not be possible to contribute an untyped property', () => {
            expect(() => ModelMetadata.forType(Invalid_UntypedProperty)).toThrow();
        })

        it('should have default values for the boolean property attributes', () => {
            let property = ModelMetadata.forType(Test.ModelOneProperty).properties.get('prop');
            expect(property.readOnly).toBe(false, 'readOnly default set');
            expect(property.writeOnly).toBe(false, 'writeOnly default set');
            expect(property.allowNull).toBe(false, 'allowNull default set');
            expect(property.required).toBe(true, 'required default set');
        });
    });

    describe('RefPropertyMetadata', () => {

        it('should have default values for the basic property attributes', () => {
            var property = ModelMetadata.forType(Test.ModelOneProperty).properties.get('prop');
            expect(property.readOnly).toBe(false, 'readOnly default set');
            expect(property.writeOnly).toBe(false, 'writeOnly default set');
            expect(property.allowNull).toBe(false, 'allowNull default set');
            expect(property.required).toBe(true, 'required default set');
        });


        //TODO: Test for multi valued properties
        it('should be possible to define a multi-valued refProperty', () => {
            let multiProp = <RefPropertyMetadata>ModelMetadata.forType(Test.OneMultiRefProperty).properties.get('multiPropId');
            expect(multiProp.isMulti).toBe(true);
            // TODO: Need to test mutation and access to property.
        });

        it('should have the defaault value for instances', () => {
            let metadata = ModelMetadata.forType(Test.PropertyOptions);

            let noOptions = metadata.properties.get('noOptions');
            expect(noOptions.default()).toBeUndefined('No default provided');

            let valueDefault = metadata.properties.get('valueDefault');
            expect(valueDefault.default()).toBe('default value');

            let callableDefault = metadata.properties.get('callableDefault');
            expect(callableDefault.default()).toBe('return value');
        })
    });
});
