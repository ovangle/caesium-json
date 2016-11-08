import {List, Set} from 'immutable';
import {Model, Property, RefProperty} from "../../src/model/decorators";
import {ModelMetadata} from '../../src/model/metadata';
import {ModelBase} from '../../src/model/base';
import {createModelFactory} from '../../src/model/factory';
import {str} from '../../src/json_codecs';

@Model({kind: 'test::MyModel'})
abstract class MyModel extends ModelBase {
    @Property({codec: str})
    prop: string;
}

@Model({kind: 'test::ReferencedModel'})
abstract class ReferencedModel extends ModelBase {
}

@Model({kind: 'test::ReferencingModel'})
abstract class ReferencingModel extends ModelBase {
    @RefProperty({refName: 'ref', refType: ReferencedModel})
    refId: number;
    ref: ReferencedModel;

    @RefProperty({refName: 'multiRef', refType: ReferencedModel})
    multiRefId: Set<string>;
    multiRef: Set<ReferencedModel>;

}





describe('model.base', () => {
    describe('ModelBase', () => {
        var factory = createModelFactory<MyModel>(ModelMetadata.forType(MyModel));
        var referencingModelFactory = createModelFactory<ReferencingModel>(ModelMetadata.forType(ReferencingModel));

        it('should be possible to get the value of a property from a model', () => {
            var instance = factory({prop: 'hello world'});
            expect(instance.get('prop')).toBe('hello world');
        });

        it('should not be possible to directly set a value on the model', () => {
            var instance = factory({prop: 'hello world'});
            expect(() => {
                instance.id = 4239
            }).toThrow();
            expect(() => {
                instance.prop = 'hello'
            }).toThrow();
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

