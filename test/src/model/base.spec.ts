import {List} from 'immutable';
import {forwardRef} from '@angular/core';
import {Model, Property, RefProperty} from "../../../src/model/decorators";
import {ModelMetadata} from '../../../src/model/metadata';
import {ModelBase} from '../../../src/model/base';
import {modelFactory} from '../../../src/model/factory';
import {str} from '../../../src/json_codecs';

@Model({kind: 'test::MyModel'})
class MyModel extends ModelBase {
    @Property({codec: str})
    prop: string;
}

@Model({kind: 'test::ReferencingModel'})
class ReferencingModel extends ModelBase {
    @RefProperty({refName: 'ref', refType: forwardRef(() => MyModel)})
    refId: number;
    ref: MyModel;

    @RefProperty({refName: 'multiRef', refType: forwardRef(() => MyModel)})
    multiRefId: number;
    multiRef: MyModel;
}

export function modelBaseTests() {
    describe('ModelBase', () => {
        var factory = modelFactory(MyModel);
        var referencingModelFactory = modelFactory(ReferencingModel);

        it('should be possible to get the value of a property from a model', () => {
            var instance = factory({prop: 'hello world'});
            expect(instance.get('prop')).toBe('hello world');
        });

        it('should not be possible to directly set a value on the model', () => {
            var instance = factory({prop: 'hello world'});
            expect(() => { instance.id = 4239 }).toThrow();
            expect(() => { instance.prop = 'hello' }).toThrow();
        });

        it('should be possible to set the value of a property on a model', () => {
            var instance = factory({prop: 'hello world'});
            var mutated = instance.set('prop', 'goodbye') as MyModel;

            expect(instance.prop).toBe('hello world', 'original instance not mutated');
            expect(mutated.prop).toBe('goodbye', 'instance with mutated \'prop\' value');
        });

        it('should not be possible to get the value of a nonexistent property from a model', () => {
            var instance = factory({prop: 'hello world'});
            expect(() => instance.get('nonExistentProp')).toThrow();
            expect(() => instance.set('nonExistentProp', 'goodbye')).toThrow();
        });


        it('should be possible to set the value of a reference on a model', () => {
            var instance = referencingModelFactory({refId: 28});
            instance = instance.set('ref', <MyModel>{id: 42}) as ReferencingModel;

            expect(instance.refId).toBe(42, 'Should set the propId when setting the ref');
            expect(instance.ref).toEqual(<MyModel>{id: 42}, 'Should also set the ref');

            instance = instance.set('ref', null) as ReferencingModel;
            expect(instance.ref).toBe(null);
            expect(instance.refId).toBe(null);

            instance = instance.set('refId', 666) as ReferencingModel;
            expect(instance.refId).toBe(666);
            expect(instance.ref).toBe(undefined, 'Setting the id should clear the resolved value');

        });
    });

    resolvePropertyTests();
    resolveBackRefPropertyTests();
}

function resolvePropertyTests() {
    describe('.resolveProperty', () => {
        //TODO: Tests


    });
}

function resolveBackRefPropertyTests() {
    describe('.resolveBackRefProperty', () => {
        //TODO: Tests

    });
}
