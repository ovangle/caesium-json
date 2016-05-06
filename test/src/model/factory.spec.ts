import {Model, Property} from '../../../src/model/decorators';
import {ModelBase} from '../../../src/model/base';
import {ModelMetadata} from '../../../src/model/metadata';
import {str, list} from '../../../src/json_codecs';
import {createModelFactory, copyModel} from '../../../src/model/factory';

@Model({kind: 'test::MyModel'})
abstract class MyModel extends ModelBase {
    @Property({codec: str})
    prop: string;

    @Property({codec: list(str), defaultValue: Immutable.List})
    listProp: Immutable.List<string>;
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
            expect(instance.listProp).toEqual(Immutable.List());
        });

        it('should be possible to provide initial values for properties', () => {
            var instance = factory({
                prop: 'hello world',
                listProp: Immutable.List(['a', 'b', 'c'])
            });
            expect(instance.prop).toBe('hello world');
            expect(instance.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should create immutable properties for each model property', () => {
            var instance = factory({});
            var descriptor = Object.getOwnPropertyDescriptor(instance, 'prop');
            expect(descriptor).toEqual({
                enumerable: true,
                configurable: true,
                writable: false,
                value: undefined
            });
        });

        it('should throw if providing an argument which isn\'t a property on the model', () => {
            expect(() => factory({nonExistentProp: 42})).toThrow();
        });

        it('should throw when attempting to modify one of the instance properties', () => {
            var instance = factory({});
            expect(() => instance.prop = 'hello').toThrow();
        })
    });
}

export function copyModelTests() {
    describe('copyModel', () => {
        var factory = createModelFactory<MyModel>(ModelMetadata.forType(MyModel));
        var instance = factory({
            prop: 'hello world',
            listProp: Immutable.List(['a', 'b', 'c'])
        });
        it('should be possible to copy a model with no mutations', () => {
            var instanceCopy = copyModel(instance);
            
            expect(instanceCopy).toEqual(jasmine.any(MyModel));
            
            expect(instanceCopy.prop).toEqual('hello world');
            expect(instanceCopy.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should be possible to copy a model and mutate values', () => {
            var instanceCopy = copyModel(instance, [
                {property: 'prop', value: 'goodbye'}
            ]);
            expect(instanceCopy.prop).toEqual('goodbye');
            expect(instanceCopy.listProp.toArray()).toEqual(['a','b','c']);
        });

        it('should not be possible to provide a mutation which doesn\'t exist on the properties of the model', () => {
            expect(() => copyModel(instance, [
                {property: 'nonExistentProp', value: 42}
            ])).toThrow();
        });

    });
}
