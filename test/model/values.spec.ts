import {Map} from 'immutable';
import {Type} from 'caesium-core/lang';
import {ValueAccessor, ModelValues, initialModelValues} from '../../src/model/values';
import {ModelMetadata} from '../../src/model/metadata';

import * as Test from './models';

function getAccessor(type: Type, prop: string) {
    let metadata = ModelMetadata.forType(type);
    return metadata.getProperty(prop).valueAccessor;
}

function mkModelValues(values?: any, resolvedRefs?: any): ModelValues {
    return {
        values: Map<string,any>(values),
        resolvedRefs: Map<string,any>(resolvedRefs)
    }
}

describe('model.values', () => {
    describe('ValueAccessor', () => {

        it('should initialize a property to it\'s default value', () => {
            let accessor = getAccessor(Test.PropertyOptions, 'valueDefault');
            let modelValues = mkModelValues();

            expect(accessor.get(modelValues, false)).toBe('default value');
            expect(() => accessor.get(modelValues, true)).toThrow();
        });

        it('should get a property', () => {
            let accessor = getAccessor(Test.ModelOneProperty, 'prop');
            let values = mkModelValues({
                prop: 'retrieved'
            })
            expect(accessor.get(values, false)).toBe('retrieved');
            expect(() => accessor.get(values, /* getRef */ true)).toThrow();
        })

        it('should be able to set a property', () => {
            let accessor = getAccessor(Test.ModelOneProperty, 'prop');
            let initial = mkModelValues();

            let updated = accessor.set(initial, 'set to a value', /* setRef */ false);

            expect(updated.values.get('prop')).toBe('set to a value');
            expect(initial.values.get('prop')).toBeUndefined('should not alter the original instance');
        });


        it('should be have a model descriptor', () => {
            let accessor = getAccessor(Test.ModelOneProperty, 'prop');

            let expectDescriptor: PropertyDescriptor = {
                configurable: false,
                enumerable: true,
                get: <any>jasmine.any(Function),
                set: <any>jasmine.any(Function)
            }
            expect(accessor.descriptors).toEqual([
                ['prop', expectDescriptor]
            ]);

            let _this = {
                __modelValues__: initialModelValues
            };
        });
    });

    describe('RefAccessor', () => {
        it('should get a property reference', () => {
            let accessor = getAccessor(Test.ModelOneRefProperty, 'propId');
            let reference = new Test.ModelNoProperties(12345);
            let values = mkModelValues(
                {propId: 12345},
                {propId: reference}
            );
            expect(accessor.get(values, true)).toBe(reference);
            expect(accessor.get(values, false)).toBe(12345);
        });

        it('should set a property reference ID', () => {
            let accessor = getAccessor(Test.ModelOneRefProperty, 'propId');

            let reference = new Test.ModelNoProperties(54321);

            let initial = mkModelValues();
            let updated = accessor.set(initial, reference.id, /* setRef: */ false);

            expect(accessor.get(updated, true)).toBeUndefined();
            expect(accessor.get(updated, false)).toBe(54321);
        })

        it('should set a property reference', () => {
            let accessor = getAccessor(Test.ModelOneRefProperty, 'propId');

            let reference = new Test.ModelNoProperties(54321);

            let initial = mkModelValues();
            let updated = accessor.set(initial, reference, /* setRef */ true);

            expect(accessor.get(updated, true)).toBe(reference);
            expect(accessor.get(updated, false)).toBe(54321);

        })

        it('should be have a model descriptor', () => {
            let accessor = getAccessor(Test.ModelOneRefProperty, 'propId');

            let expectDescriptor: PropertyDescriptor = {
                configurable: false,
                enumerable: true,
                get: <any>jasmine.any(Function),
                set: <any>jasmine.any(Function)
            }
            // There are two descriptors, one for the prop and one for the ID
            expect(accessor.descriptors).toEqual([
                ['propId', expectDescriptor],
                ['prop', expectDescriptor]
            ]);

        });

    });
});
