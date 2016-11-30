import {forwardRef} from '@angular/core';

import {Type} from 'caesium-core/lang';

import {PropertyMetadata, RefPropertyMetadata} from '../../src/model/metadata';
import {Model, Property} from '../../src/model/decorators';

import {ModelBase} from '../../src/model/base';
import {str} from '../../src/json_codecs/index';

import * as Test from './models';

function _getProxiedType<T>(type: Type<T>): Type<T> {
    return (type as any).__type_ref__;

}

describe('model.decorators', () => {
    describe('Model', () => {

        it('should be possible to create an instance of a model', () => {
            let m = new Test.ModelNoProperties();
            expect(m instanceof Test.ModelNoProperties).toBe(true, 'Should be an instance of the type');
            expect(m instanceof ModelBase).toBe(true, 'Every model should be an instance of ModelBase');
            expect(Object.isFrozen(m)).toBe(true, 'Instance should be frozen');

            let modelSubtype = new Test.ModelSubtype();
            expect(modelSubtype instanceof Test.ModelSupertype).toBe(true, 'Should preserve prototype chain');
            expect(modelSubtype instanceof Test.ModelSubtype).toBe(true, 'Also an instance of subtype');
            expect(Object.isFrozen(modelSubtype)).toBe(true, 'Subtypes should also be frozen');
        });

        it(`should define the 'model:options' and 'model:properties' metadata keys of the type`, () => {
            let ModelNoProperties = _getProxiedType(Test.ModelNoProperties);
            expect(Reflect.getMetadata('model:options', ModelNoProperties))
                .toEqual({kind:'model::ModelNoProperties'});
            expect(Reflect.getMetadata('model:properties', ModelNoProperties)).toEqual([]);
        });
    });

    describe('Property', () => {
        it('should add the property to the \'model.properties\' key of the type', () => {
            let ModelOneProperty = _getProxiedType(Test.ModelOneProperty);

            let properties: any[] = Reflect.getMetadata('model:properties', ModelOneProperty);
            // An extra arg was passed for subtypes.
            expect(properties.length).toBe(2);
            let ownProperties = properties.filter(prop => prop !== null);
            expect(ownProperties).toEqual([{isRef: false, args: jasmine.any(Array)}]);
            expect(ownProperties[0].args.slice(1,3)).toEqual(['prop', String]);
        });

        it(`should contain property data for all the properties of a model`, () => {
            let ModelMixedProperties = _getProxiedType(Test.ModelMixedProperties);
            let properties: any[] = Reflect.getMetadata('model:properties', ModelMixedProperties);
            let ownProperties = properties.filter(prop => prop !== null);

            expect(ownProperties).toEqual([
                {isRef: true, args: jasmine.any(Array)},
                {isRef: false, args: jasmine.any(Array)},
                {isRef: false, args: jasmine.any(Array)},
                {isRef: true, args: jasmine.any(Array)}
            ]);

            let propNameTypes = ownProperties.map((prop: any) => prop.args.slice(1, 3));
            expect(propNameTypes).toEqual([
                ['propOne', Number],
                ['propTwo', String],
                ['propThree', String],
                ['propFour', Number]
            ]);
        });
    });

    describe('RefProperty', () => {
        it('should add the property to the \'model.properties\' key of the type', () => {
            let ModelOneRefProperty = _getProxiedType(Test.ModelOneRefProperty);
            let properties: any[] = Reflect.getMetadata('model:properties', ModelOneRefProperty);
            expect(properties.length).toBe(1);
            let ownProperties = properties.filter(prop => prop !== null);
            expect(ownProperties).toEqual([{isRef: true, args: jasmine.any(Array)}]);
            expect(ownProperties[0].args.slice(1,3)).toEqual(['propId', Number]);
        });
    });
});
