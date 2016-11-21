import {List} from 'immutable';
import {forwardRef} from '@angular/core';
import {Model, Property, ModelBase} from '../../src/model';
import {createModelFactory, ModelFactory} from '../../src/model/factory';
import {str, dateTime, num, list} from '../../src/json_codecs/basic';
import {model} from '../../src/json_codecs/model_to_json';
import {ModelMetadata} from "../../src/model/metadata";

// Models for model converter test.
@Model({kind: 'test::MyModel', isAbstract: true})
export class MyModel extends ModelBase {
    //static create = createModelFactory<MyModel>(MyModel);
    constructor(
        @Property('name', {codec: str})
        public name: string,
        @Property('aliases', {codec: list(str)})
        public aliases: List<string>,
        @Property('birthday', {codec: dateTime, allowNull: true})
        public birthday: Date,
        ...args: any[]
    ) {
        super(name, aliases, birthday, ...args);
    }
}

@Model({kind: 'test::Submodel', superType: MyModel})
export class SubModel extends MyModel {

    static create = createModelFactory<SubModel>(SubModel);

    constructor(
        name: string,
        aliases: List<string>,
        birthday: Date,
        @Property('submodelProperty', {codec: str, allowNull: true})
        submodelProperty:string
    ) {
        super(name, aliases, birthday, submodelProperty);
    }
}

describe('json_codecs.model_to_json', () => {
    it('should be possible to encode a model as json', () => {
        var codec = model(SubModel);

        let instance = SubModel.create({
            name: 'henry',
            aliases: List(['hank']),
            birthday: new Date(0),
            submodelProperty: 'hello world'
        });

        expect(codec.encode(instance)).toEqual({
            kind: 'test::Submodel',
            name: 'henry',
            aliases: ['hank'],
            birthday: '1970-01-01T00:00:00.000Z',
            submodel_property: 'hello world'
        });
    });

    it('should be possible to decode a model from json', () => {
        let codec = model<MyModel>(SubModel);

        let modelJson: any = {
            kind: 'test::MyModel',
            name: 'john',
            aliases: ['jack', 'jo'],
            birthday: '1970-01-01T00:00:00.000Z'
        };

        let instance = codec.decode(modelJson);

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
