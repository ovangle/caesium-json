import {List, Set} from 'immutable';
import {forwardRef} from '@angular/core';
import {Model, Property, RefProperty} from "../../src/model/decorators";
import {ModelMetadata} from '../../src/model/metadata';
import {ModelBase} from '../../src/model/base';
import {createModelFactory} from '../../src/model/factory';
import {str, num} from '../../src/json_codecs';

//TODO: Move all models defined here to models.
import * as Test from './models';


@Model({kind: 'test::ReferencedModel'})
class ReferencedModel extends ModelBase {
    constructor(
        @Property('id', {key: true, codec: num})
        public id: number
    ) {
        super(id);
    }
}

@Model({kind: 'test::ReferencingModel'})
class ReferencingModel extends ModelBase {
    constructor(
        @RefProperty('refId', {refName: 'ref', refType: forwardRef(() => ReferencedModel)})
        public refId: number,
        @RefProperty('multiRefId', {refName: 'multiRef', refType: forwardRef(() => ReferencedModel), isMulti: true})
        public multiRefId: List<number>
    ) {
        super(refId, multiRefId);
    }
    ref: ReferencedModel;
    multiRef: List<ReferencedModel>;
}

describe('model.base', () => {
    describe('ModelBase', () => {

        it('should be possible to get the value of a property from a model', () => {
            let factory = createModelFactory(Test.ModelOneProperty);
            var instance = factory({prop: 'hello world'});
            expect(instance.get('prop')).toBe('hello world');
        });

        it('should be possible to get the property value from an attribute', () => {
            let factory = createModelFactory<Test.ModelOneProperty>(Test.ModelOneProperty);
            let instance = factory({prop: 'accessible via attribute'});
            expect(instance.prop).toBe('accessible via attribute');
        });

        it('should not be possible to directly set a value on the model', () => {
            let factory = createModelFactory<Test.ModelOneProperty>(Test.ModelOneProperty);
            var instance = factory({prop: 'hello world'});
            expect(() => { instance.prop = 'hello' }).toThrow();
        });

        it('should be possible to set the value of a property on a model', () => {
            let factory = createModelFactory<Test.ModelOneProperty>(Test.ModelOneProperty);
            var instance = factory({prop: 'hello world'});
            var mutated = instance.set('prop', 'goodbye');

            expect(instance.prop).toBe('hello world', 'original instance not mutated');
            expect(mutated.prop).toBe('goodbye', 'instance with mutated \'prop\' value');
        });

        it('setting the value to an equal reference will not return a new instance of the model', () => {
            // This is important, since a large selling point of immutability in angular
            // is to reduce change detection overhead.
            let instance = new Test.ModelOneProperty('hello world');
            expect(instance.set('prop', 'hello world')).toBe(instance, 'should be same ref');
        })

        it('should not be possible to get the value of a nonexistent property from a model', () => {
            let factory = createModelFactory(Test.ModelOneProperty);
            var instance = factory({prop: 'hello world'});
            expect(() => instance.get('nonExistentProp')).toThrow();
            expect(() => instance.set('nonExistentProp', 'goodbye')).toThrow();
        });


        it('should be possible to set the value of a reference on a model', () => {
            let factory = createModelFactory<ReferencingModel>(ReferencingModel);

            var instance = factory({refId: 28});
            let reference = new ReferencedModel(42);
            instance = instance.set('ref', reference);

            expect(instance.refId).toBe(42, 'Should set the propId when setting the ref');
            expect(instance.ref).toBe(reference, 'Should also set the ref');

            instance = instance.set('ref', null);
            expect(instance.ref).toBe(null);
            expect(instance.refId).toBe(null);

            instance = instance.set('refId', 666);
            expect(instance.refId).toBe(666);
            expect(instance.ref).toBe(undefined, 'Setting the id should clear the resolved value');

        });

        it('setting a reference value to reference will not return a new instance of the model', () => {
            // This is important, since a large selling point of immutability in angular
            // is to reduce change detection overhead.
            let instance = new ReferencingModel(2, List([3,4,5]));
            let reference = new ReferencedModel(88);
            let i_1 = instance.set('ref', reference);
            expect(i_1).not.toBe(instance, 'changed value of ref');
            let i_2 = instance.set('ref', reference);

            expect(instance.set('ref', new ReferencedModel(null))).not.toBe(instance, 'new value for ref');
        });

        it('should be possible to get and set values on a subtype', () => {
            let s = new Test.OneSubtypeProperty('hello', 'world');
            expect(s.prop).toEqual('hello', 'Should be able to get inherited properties');
            expect(s.newProp).toEqual('world', 'Should be able to get the subtype property');

            s = s.set('prop', 'goodbye');
            expect(s.prop).toBe('goodbye', 'Should have mutated the inherited prop');
            s = s.set('newProp', 'everyone');
            expect(s.newProp).toEqual('everyone', 'Should have set the subtype property');
        })
    });
});
