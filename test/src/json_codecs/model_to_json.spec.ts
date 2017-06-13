import {List} from 'immutable';
import {Model, Property, ModelBase} from '../../../src/model';
import {modelFactory} from '../../../src/model/factory';
import {str, date, num, list} from '../../../src/json_codecs/basic';
import {model} from '../../../src/json_codecs/model_to_json';
import {ModelMetadata} from "../../../src/model/metadata";

// Models for model converter test.
@Model({kind: 'test::MyModel', isAbstract: true})
class MyModel extends ModelBase {
    @Property({codec: str})
    name:string;

    @Property({codec: list(str)})
    aliases:List<string>;

    @Property({codec: date})
    birthday:Date;
}

@Model({kind: 'test::Submodel', superType: MyModel})
class SubModel extends MyModel {
    @Property({codec: str})
    submodelProperty:string;
}

export function modelToJsonTests() {

    describe('model_to_json', () => {
        modelTests();
    });
}

function modelTests() {
    describe('model', () => {
        it('should be possible to encode a model as json', () => {
            const codec = model(SubModel);

            const factory = modelFactory(SubModel);
            const instance = factory({
                name: 'henry',
                aliases: List(['hank']),
                birthday: new Date(0),
                submodelProperty: 'hello world'
            });

            expect(codec.encode(instance)).toEqual({
                id: null,
                kind: 'test::Submodel',
                name: 'henry',
                aliases: ['hank'],
                birthday: '1970-01-01T00:00:00.000Z',
                submodel_property: 'hello world'
            });
        });

        it('should be possible to decode a model from json', () => {
            var codec = model<MyModel>(SubModel);

            var modelJson = {
                kind: 'test::MyModel',
                name: 'john',
                aliases: ['jack', 'jo'],
                birthday: '1970-01-01T00:00:00.000Z'
            };

            var instance = codec.decode(modelJson);
            expect(instance).toEqual(jasmine.any(MyModel));
            expect(instance.name).toBe('john');
            expect(instance.aliases).toEqual(List(['jack', 'jo']));
            expect(instance.birthday).toEqual(new Date(0));
        });

        it('should handle blank values', () => {
            var codec = model(SubModel);
            expect(codec.encode(null)).toBeNull('encode null');
            expect(codec.decode(null)).toBeNull('decode null');
            expect(codec.encode(undefined)).toBeUndefined('encode undefined');
            expect(codec.decode(undefined)).toBeUndefined('decode undefined');
        });
    });
}
