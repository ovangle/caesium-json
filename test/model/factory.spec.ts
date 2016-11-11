import {List} from 'immutable';

import {forwardRef} from '@angular/core';

import {FactoryException} from '../../src/exceptions';
import {Model, Property, RefProperty} from '../../src/model/decorators';
import {ModelBase} from '../../src/model/base';
import {ModelMetadata} from '../../src/model/metadata';
import {str, list} from '../../src/json_codecs';
import {createModelFactory, copyModel} from '../../src/model/factory';

@Model({kind: 'test::MyModel'})
class MyModel extends ModelBase {
    constructor(
        id: number,
        @Property('prop', {codec: str})
        public prop: string,
        @Property('listProp', {codec: list(str), defaultValue: List, isMulti: true})
        public listProp: List<string>,
        // @Property('ref')
        // public ref: MyBackRefModel
        @RefProperty('refId', {refName: 'ref', refType: forwardRef(() => MyBackRefModel)})
        public refId: number,
        // @Property('multiRef', {itemType: forwardRef(() => AbstractModel)})
        public multiRef: Set<AbstractModel>
    ) {
        super(id, prop, listProp, refId, multiRef);
    }

    public ref: MyBackRefModel;

    foo() { return this.prop; }
}

@Model({kind: 'test::AbstractModel', isAbstract: true})
class AbstractModel extends ModelBase {
    constructor(
        id: number,
        @Property('prop', {codec: str}) public prop: string
    ) {
        super(id, prop);
    }
}

@Model({kind: 'test::MyModel'})
class MyBackRefModel extends ModelBase {
}


describe('model.factory', () => {
    describe('createModel', () => {
        it('should be possible to create a new instance of a model with no initial property values', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({});
            expect(instance).toEqual(jasmine.any(MyModel));
            expect(instance.prop).toBeNull();
        });

        it('should provide default values for any properties with a defaultValue', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({});
            expect(instance.listProp).toEqual(List());
        });

        it('should be possible to provide initial values for properties', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({
                prop: 'hello world',
                listProp: List(['a', 'b', 'c'])
            });
            expect(instance.prop).toBe('hello world');
            expect(instance.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should be possible to set initial values for both the ref property and it\'s value', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({refId: 40});
            expect(instance.refId).toBe(40, 'Set refId directly');

            let reference = new MyBackRefModel(40);
            var instance = factory({ref: reference});
            expect(instance.refId).toBe(40, 'Set refId via ref');
            expect(instance.ref).toBe(reference, 'Set ref property');

            var instance = factory({refId: null});
            expect(instance.refId).toBe(null, 'Can set refId to `null`');

            var instance = factory({ref: null});
            expect(instance.refId).toBe(null, 'Can set ref to `null`');
            expect(instance.ref).toBe(null);
        });

        it('should inherit all methods defined on the instance', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({prop: 'hello world'});
            expect(instance.foo()).toBe('hello world');
        });

        it('should throw if providing an argument which isn\'t a property on the model', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            expect(() => factory({nonExistentProp: 42})).toThrow();
        });

        it('should throw when attempting to modify one of the instance properties', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({});
            expect(() => instance.prop = 'hello').toThrow();
        });

        it('should not be possible to create a factory for an abstract model type', () => {
            expect(() => createModelFactory(AbstractModel))
                .toThrow(jasmine.any(FactoryException));
        })
    });

    describe('copyModel', () => {


        it('should be possible to copy a model with no mutations', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({
                prop: 'hello world',
                listProp: List(['a', 'b', 'c'])
            });
            var instanceCopy = copyModel(instance);

            expect(instanceCopy).toEqual(jasmine.any(MyModel));

            expect(instanceCopy.prop).toEqual('hello world');
            expect(instanceCopy.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should be possible to copy a model with mutations', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({
                prop: 'hello world',
                listProp: List(['a', 'b', 'c'])
            });
            let copy = copyModel(instance, {
                prop: 'is mutated',
                listProp: instance.listProp.push('d')
            });

            expect(copy.prop).toEqual('is mutated');
            expect(copy.listProp.toArray()).toEqual(['a','b','c','d']);

            expect(instance.prop).toEqual('hello world', 'Does not edit orinal instance');
        });

        it('should not be possible to provide a mutation which doesn\'t exist on the properties of the model', () => {
            var factory = createModelFactory<MyModel>(MyModel);
            var instance = factory({
                prop: 'hello world',
                listProp: List(['a', 'b', 'c'])
            });
            expect(() => copyModel(instance, [{propName: 'nonExistentProp', value: 42}])).toThrow();
        });

    });
});
