import {List} from 'immutable';
import {Model, Property, RefProperty, BackRefProperty} from "../../../src/model/decorators";
import {ModelMetadata} from '../../../src/model/metadata';
import {ModelBase} from '../../../src/model/base';
import {createModelFactory} from '../../../src/model/factory';
import {str} from '../../../src/json_codecs';

@Model({kind: 'test::MyModel'})
abstract class MyModel extends ModelBase {
    @Property({codec: str})
    prop: string;
}

@Model({kind: 'test::ReferencedModel'})
abstract class ReferencedModel extends ModelBase {
    @BackRefProperty({to: ReferencingModel, refProp: 'refId'})
    reference: ReferencingModel;

    @BackRefProperty({to: ReferencingModel, refProp: 'refId', multi: true})
    mutltiReferences: List<ReferencingModel>;
}

@Model({kind: 'test::ReferencingModel'})
abstract class ReferencingModel extends ModelBase {
    @RefProperty({refName: 'ref'})
    refId: number;
    ref: MyBackRefModel;

    @RefProperty({refName: 'multiRef'})
    multiRefId: number;
    multiRef: MyMultiBackRefModel;
}



@Model({kind: 'test::MyModel'})
abstract class MyBackRefModel extends ModelBase {
    @BackRefProperty({to: ReferencingModel, refProp: 'refId'})
    backRef: ReferencingModel;
}

@Model({kind: 'test::MyModel'})
abstract class MyMultiBackRefModel extends ModelBase {
    @BackRefProperty({to: ReferencingModel, refProp: 'multiRefId', multi: true})
    multiBackRef: List<ReferencingModel>;
}



export function modelBaseTests() {
    describe('ModelBase', () => {
        var factory = createModelFactory<MyModel>(ModelMetadata.forType(MyModel));
        var referencingModelFactory = createModelFactory<ReferencingModel>(ModelMetadata.forType(ReferencingModel));
        var backRefModelFactory = createModelFactory<MyBackRefModel>(ModelMetadata.forType(MyBackRefModel));
        var multiBackRefModelFactory = createModelFactory<MyMultiBackRefModel>(ModelMetadata.forType(MyMultiBackRefModel));

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

        it('should be possible to set the value of a single value back reference on a model', () => {
            var refInstance : ReferencingModel = referencingModelFactory({id: 1, refId: 33});
            expect(refInstance.ref).toBeUndefined('foreign ref should not be resolved');

            var instance = backRefModelFactory({id: 33});
            instance = instance.set('backRef', refInstance) as MyBackRefModel;

            expect(instance.get('backRef').id).toEqual(1);
            expect(instance.get('backRef').ref).toBeUndefined('should not attempt to resolve ref');

            instance = instance.set('backRef', null) as MyBackRefModel;
            expect(instance.get('backRef')).toBeNull();
        });

        it('should not be possible to set the value of a single value back reference to an invalid reference', () => {
            var refInstance = referencingModelFactory({id: 1, refId: 33});
            var instance = backRefModelFactory({id: 34});
            expect(() => instance.set('backRef', refInstance)).toThrow();
        });

        it('should be possible to set the value of a multi value back reference on a model', () => {
            var refInstances = List.of(
                referencingModelFactory({id: 1, multiRefId: 33}),
                referencingModelFactory({id: 2, multiRefId: 33})

            );
            var instance = multiBackRefModelFactory({id: 33});

            instance = instance.set('multiBackRef', refInstances) as MyMultiBackRefModel;
            expect(instance.get('multiBackRef').get(0).id).toEqual(1);
            expect(instance.get('multiBackRef').get(1).id).toEqual(2);

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
