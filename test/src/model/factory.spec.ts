import {List} from 'immutable';
import {Model, Property, RefProperty} from '../../../src/model/decorators';
import {ModelBase} from '../../../src/model/base';
import {ModelMetadata} from '../../../src/model/metadata';
import {str, list} from '../../../src/json_codecs';
import {createModelFactory, copyModel} from '../../../src/model/factory';

@Model({kind: 'test::MyModel'})
abstract class MyModel extends ModelBase {
    @Property({codec: str})
    prop: string;

    @Property({codec: list(str), defaultValue: List})
    listProp: List<string>;

    @RefProperty({refName: 'ref'})
    refId: number;

    ref: MyModel;

    foo() {
        return this.prop;
    }
}


export function modelFactoryTests() {
    describe('factory', () => {
        createModelTests();
        copyModelTests();
    });
}

export function createModelTests() {
    describe('createModel', () => {
        var factory = createModelFactory<MyModel>(ModelMetadata.forType(MyModel));
        it('should be possible to create a new instance of a model with no initial property values', () => {
            var instance = factory({});
            expect(instance).toEqual(jasmine.any(MyModel));
            expect(instance.prop).toBeUndefined();
        });

        it('should provide default values for any properties with a defaultValue', () => {
            var instance = factory({});
            expect(instance.listProp).toEqual(List());
        });

        it('should be possible to provide initial values for properties', () => {
            var instance = factory({
                prop: 'hello world',
                listProp: List(['a', 'b', 'c'])
            });
            expect(instance.prop).toBe('hello world');
            expect(instance.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should be possible to set initial values for both the ref property and it\'s value', () => {
            var instance = factory({refId: 40});
            expect(instance.refId).toBe(40, 'Set refId directly');

            var instance = factory({ref: {id: 40}});
            expect(instance.refId).toBe(40, 'Set refId via ref');
            expect(instance.ref).toEqual({id: 40}, 'Set ref property');

            var instance = factory({refId: null});
            expect(instance.refId).toBe(null, 'Can set refId to `null`');

            var instance = factory({ref: null});
            expect(instance.refId).toBe(null, 'Can set ref to `null`');
            expect(instance.ref).toBe(null);
        });

        it('should inherit all methods defined on the instance', () => {
            var instance = factory({prop: 'hello world'});
            expect(instance.foo()).toBe('hello world');
        });

        it('should throw if providing an argument which isn\'t a property on the model', () => {
            expect(() => factory({nonExistentProp: 42})).toThrow();
        });

        it('should throw when attempting to modify one of the instance properties', () => {
            var instance = factory({});
            expect(() => instance.prop = 'hello').toThrow();
        });
    });
}

export function copyModelTests() {
    describe('copyModel', () => {
        var factory = createModelFactory<MyModel>(ModelMetadata.forType(MyModel));
        var instance = factory({
            prop: 'hello world',
            listProp: List(['a', 'b', 'c'])
        });

        it('should be possible to copy a model with no mutations', () => {
            var instanceCopy = copyModel(instance);

            expect(instanceCopy).toEqual(jasmine.any(MyModel));

            expect(instanceCopy.prop).toEqual('hello world');
            expect(instanceCopy.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should be possible to copy a model and mutate values', () => {
            var instanceCopy = copyModel(instance, [{propName: 'prop', value: 'goodbye'}]);
            expect(instanceCopy.prop).toEqual('goodbye');
            expect(instanceCopy.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should not be possible to provide a mutation which doesn\'t exist on the properties of the model', () => {
            expect(() => copyModel(instance, [{propName: 'nonExistentProp', value: 42}])).toThrow();
        });

    });
}
