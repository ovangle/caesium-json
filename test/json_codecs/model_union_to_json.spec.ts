import {identity} from 'caesium-core/codec';

import {ModelBase} from "../../src/model/base";
import {Model, Property} from "../../src/model/decorators";
import {union} from "../../src/json_codecs/model_union_to_json";
import {createModelFactory} from '../../src/model/factory';
import {ModelMetadata} from "../../src/model/metadata";

@Model({kind: 'test::ModelA'})
class ModelA extends ModelBase {
    constructor(
        id: number,
        @Property('propOne', {codec: identity})
        propOne: string
    ) {
        super(id, propOne);
    }
}

@Model({kind: 'test::ModelB'})
class ModelB extends ModelBase {
    constructor(
        id: number,
        @Property('propTwo', {codec: identity})
        propTwo: string
    ) {
        super(id, propTwo);
    }
}

describe('json_codecs.model_union_to_json', () => {
    var codec = union(ModelA, ModelB);
    it('should be possible to decode a json object based on it\'s kind', () => {
        var jsonDataA: any = {
            id: null,
            kind: 'test::ModelA',
            prop_one: 'hello world'
        };

        var instanceA = codec.decode(jsonDataA);
        expect(instanceA).toEqual(jasmine.any(ModelA));
        expect(instanceA.propOne).toBe('hello world');

        var jsonDataB: any = {
            id: null,
            kind: 'test::ModelB',
            prop_two: 'goodbye'
        };

        var instanceB = codec.decode(jsonDataB);
        expect(instanceB).toEqual(jasmine.any(ModelB));
        expect(instanceB.propTwo).toBe('goodbye');
    });

    it('should be possible to encode an instance based on its type', () => {
        var instanceA = new ModelA(null, 'hello world');


        expect(codec.encode(instanceA)).toEqual({
            id: null,
            kind: 'test::ModelA',
            prop_one: 'hello world'
        });

        var instanceB = new ModelB(null, 'goodbye');

        expect(codec.encode(instanceB)).toEqual({
            id: null,
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


