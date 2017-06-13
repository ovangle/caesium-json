import {identity} from 'caesium-core/codec';

import {ModelBase} from "../../../src/model/base";
import {Model, Property} from "../../../src/model/decorators";
import {union} from "../../../src/json_codecs/model_union_to_json";
import {modelFactory} from '../../../src/model/factory';
import {ModelMetadata} from "../../../src/model/metadata";


@Model({kind: 'test::ModelA'})
class ModelA extends ModelBase {
    @Property({codec: identity})
    propOne: string
}

@Model({kind: 'test::ModelB'})
class ModelB extends ModelBase {
    @Property({codec: identity})
    propTwo: string;
}

export function modelUnionToJsonTests() {
    describe('model_union_to_json', () => {
        codecTests();
    });
}

function codecTests() {
    describe('modelUnionToJson', () => {
        var codec = union(ModelA, ModelB);
        it('should be possible to decode a json object based on it\'s kind', () => {
            var jsonDataA = {
                kind: 'test::ModelA',
                prop_one: 'hello world'
            };

            var instanceA = codec.decode(jsonDataA);
            expect(instanceA).toEqual(jasmine.any(ModelA));
            expect(instanceA.propOne).toBe('hello world');

            var jsonDataB = {
                kind: 'test::ModelB',
                prop_two: 'goodbye'
            };

            var instanceB = codec.decode(jsonDataB);
            expect(instanceB).toEqual(jasmine.any(ModelB));
            expect(instanceB.propTwo).toBe('goodbye');
        });

        it('should be possible to encode an instance based on its type', () => {
            var modelFactoryA = modelFactory(ModelA);
            var instanceA = modelFactoryA({propOne: 'hello world'});

            expect(codec.encode(instanceA)).toEqual({
                kind: 'test::ModelA',
                id: null,
                prop_one: 'hello world'
            });

            var modelFactoryB = modelFactory(ModelB);
            var instanceB = modelFactoryB({propTwo: 'goodbye'});

            expect(codec.encode(instanceB)).toEqual({
                kind: 'test::ModelB',
                id: null,
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
}


