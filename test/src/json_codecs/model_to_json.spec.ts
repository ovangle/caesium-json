import {Model, Property, ModelBase} from '../../../src/model';
import {createModelFactory} from '../../../src/model/factory';
import {str, date, num, list} from '../../../src/json_codecs/basic';
import {model} from '../../../src/json_codecs/model_to_json';
import {ModelMetadata} from "../../../src/model/metadata";

// Models for model converter test.
@Model({kind: 'test::MyModel'})
abstract class MyModel extends ModelBase {
    @Property({codec: str})
    name:string;

    @Property({codec: list(str)})
    aliases:Immutable.List<string>;

    @Property({codec: date})
    birthday:Date;
}

@Model({kind: 'test::Submodel', superType: MyModel})
abstract class SubModel extends MyModel {
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
            var codec = model(MyModel);

            var modelFactory = createModelFactory<MyModel>(ModelMetadata.forType(MyModel));
            var instance = modelFactory({
                name: 'henry',
                aliases: Immutable.List(['hank']),
                birthday: new Date(0),
            });

            expect(codec.encode(instance)).toEqual({
                kind: 'test::MyModel',
                name: 'henry',
                aliases: ['hank'],
                birthday: '1970-01-01T00:00:00.000Z'
            });
        });

        it('should be possible to decode a model from json', () => {
            var codec = model<MyModel>(MyModel);

            var modelJson = {
                kind: 'test::MyModel',
                name: 'john',
                aliases: ['jack', 'jo'],
                birthday: '1970-01-01T00:00:00.000Z'
            };

            var instance = codec.decode(modelJson);
            expect(instance).toEqual(jasmine.any(MyModel));
            expect(instance.name).toBe('john');
            expect(instance.aliases).toEqual(Immutable.List(['jack', 'jo']));
            expect(instance.birthday).toEqual(new Date(0));
        });

        it('should handle blank values', () => {
            var codec = model(MyModel);
            expect(codec.encode(null)).toBeNull('encode null');
            expect(codec.decode(null)).toBeNull('decode null');
            expect(codec.encode(undefined)).toBeUndefined('encode undefined');
            expect(codec.decode(undefined)).toBeUndefined('decode undefined');
        });


            /*
            const encoder = model(MyModel);
            const decoder = encoder.inverse();

            var henry = new MyModel();
            henry.name = 'henry';
            henry.aliases = Immutable.List(['jake', 'bill']);
            henry.birthday = new Date(0);

            var henryJson ={
                name: 'henry',
                aliases: ['jake', 'bill'],
                birthday: '1970-01-01T00:00:00.000Z',
                kind: 'test::MyModel'
            };

            expect(encoder.encode(henry)).toEqual(henryJson);

            var decoded = decoder.encode(henryJson);

            expect(decoded).toEqual(henry);
            expect(decoded instanceof MyModel).toBeTruthy();
            expect(decoded instanceof SubModel).toBeFalsy();
        });


        it('should be possible to convert a subtype', () => {
            var encoder = model(SubModel);
            var decoder = encoder.inverse();

            var instance = new SubModel();
            instance.name = 'henry';
            instance.aliases = Immutable.List(['jake', 'bill']);
            instance.birthday = new Date(0);
            instance.submodelProperty = 'a';

            var result = {
                name: 'henry',
                aliases: ['jake', 'bill'],
                birthday: '1970-01-01T00:00:00.000Z',
                submodel_property: 'a',
                kind: 'test::Submodel'
            };

            expect(encoder.encode(instance)).toEqual(result);
            var decoded = decoder.encode(result);
            expect(decoded).toEqual(instance);
            expect(decoded instanceof MyModel).toBeTruthy();
            expect(decoded instanceof SubModel).toBeTruthy();
        });
        */

    });
}
