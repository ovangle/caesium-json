import {Model, Property} from "../../../src/model/decorators";
import {ModelMetadata} from '../../../src/model/metadata';
import {ModelBase} from '../../../src/model/base';
import {createModelFactory} from '../../../src/model/factory';
import {str} from '../../../src/json_codecs';

@Model({kind: 'test::MyModel'})
abstract class MyModel extends ModelBase {
    @Property({codec: str})
    prop: string;

}


export function modelBaseTests() {
    describe('ModelBase', () => {
        var factory = createModelFactory<MyModel>(ModelMetadata.forType(MyModel));

        it('should be possible to get the value of a property from a model', () => {
            var instance = factory({prop: 'hello world'});
            expect(instance.get('prop')).toBe('hello world');
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

    });
}
