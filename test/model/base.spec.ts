import {List, Set} from 'immutable';
import {forwardRef} from '@angular/core';
import {Model, Property, RefProperty} from "../../src/model/decorators";
import {ModelMetadata} from '../../src/model/metadata';
import {ModelBase} from '../../src/model/base';
import {createModelFactory} from '../../src/model/factory';
import {str} from '../../src/json_codecs';

//TODO: Move all models defined here to models.
import * as Test from './models';


@Model({kind: 'test::ReferencedModel'})
class ReferencedModel extends ModelBase {
}

@Model({kind: 'test::ReferencingModel'})
class ReferencingModel extends ModelBase {
    constructor(
        id: number,
        @RefProperty('refId', {refName: 'ref', refType: forwardRef(() => ReferencedModel)})
        public refId: number,
        @RefProperty('multiRefId', {refName: 'multiRef', refType: forwardRef(() => ReferencedModel), isMulti: true})
        public multiRefId: List<number>
    ) {
        super(id, refId, multiRefId);
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
            expect(() => {
                instance.id = 4239
            }).toThrow();
            expect(() => {
                instance.prop = 'hello'
            }).toThrow();
        });

        it('should be possible to set the value of a property on a model', () => {
            let factory = createModelFactory<Test.ModelOneProperty>(Test.ModelOneProperty);
            var instance = factory({prop: 'hello world'});
            var mutated = instance.set('prop', 'goodbye');

            expect(instance.prop).toBe('hello world', 'original instance not mutated');
            expect(mutated.prop).toBe('goodbye', 'instance with mutated \'prop\' value');
        });

        it('should not be possible to get the value of a nonexistent property from a model', () => {
            let factory = createModelFactory(Test.ModelOneProperty);
            var instance = factory({prop: 'hello world'});
            expect(() => instance.get('nonExistentProp')).toThrow();
            expect(() => instance.set('nonExistentProp', 'goodbye')).toThrow();
        });


        it('should be possible to set the value of a reference on a model', () => {
            let factory = createModelFactory<ReferencingModel>(ReferencingModel);

            var instance = factory({refId: 28});
            instance = instance.set('ref', {id: 42}) as ReferencingModel;

            expect(instance.refId).toBe(42, 'Should set the propId when setting the ref');
            expect(instance.ref).toEqual({id: 42}, 'Should also set the ref');

            instance = instance.set('ref', null) as ReferencingModel;
            expect(instance.ref).toBe(null);
            expect(instance.refId).toBe(null);

            instance = instance.set('refId', 666) as ReferencingModel;
            expect(instance.refId).toBe(666);
            expect(instance.ref).toBe(undefined, 'Setting the id should clear the resolved value');

        });

    });
});
