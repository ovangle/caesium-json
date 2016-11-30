import {identity} from 'caesium-core/codec';

import {Model, Property, ModelBase, ModelMetadata, createModelFactory} from '../../src/model/index';
import {union} from "../../src/json_codecs/model_union_to_json";

@Model({kind: 'test::ModelA'})
class ModelA extends ModelBase {
    constructor(
        @Property('propOne', {codec: identity})
        propOne: string
    ) {
        super(propOne);
    }
}

@Model({kind: 'test::ModelB'})
class ModelB extends ModelBase {
    constructor(
        @Property('propTwo', {codec: identity})
        propTwo: string
    ) {
        super(propTwo);
    }
}

describe('json_codecs.model_union_to_json', () => {
    var codec = union(ModelA, ModelB);
    it('should be possible to decode a json object based on it\'s kind', () => {
        var jsonDataA: any = {
            kind: 'test::ModelA',
            prop_one: 'hello world'
        };

        var instanceA = codec.decode(jsonDataA);
        expect(instanceA).toEqual(jasmine.any(ModelA));
        expect(instanceA.propOne).toBe('hello world');

        var jsonDataB: any = {
            kind: 'test::ModelB',
            prop_two: 'goodbye'
        };

        var instanceB = codec.decode(jsonDataB);
        expect(instanceB).toEqual(jasmine.any(ModelB));
        expect(instanceB.propTwo).toBe('goodbye');
    });

    it('should be possible to encode an instance based on its type', () => {
        var instanceA = new ModelA('hello world');


        expect(codec.encode(instanceA)).toEqual({
            kind: 'test::ModelA',
            prop_one: 'hello world'
        });

        var instanceB = new ModelB('goodbye');

        expect(codec.encode(instanceB)).toEqual({
            kind: 'test::ModelB',
            prop_two: 'goodbye'
        });
    });

    it('should be able to handle blank values', () => {
        expect(codec.encode(null)).toBeNull('encode null');
        expect(codec.decode(null)).toBeNull('decode null');
        expect(codec.encode(undefined)).toBeUndefined('encode undefined');
        expect(codec.decode(undefined)).toBeUndefined('decode undefined');
    });
});


