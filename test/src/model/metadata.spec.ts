import {Type} from 'caesium-core/lang';
import {identity} from 'caesium-core/codec';

import {ModelMetadata, PropertyMetadata} from '../../../src/model/metadata';

export function metadataTests() {
    describe('metadata', () => {
        modelMetadataTests();
        propertyMetadataTests();
    });
}

function _mkModelMetadata(
    kind: string,
    type?: Type,
    properties?: {[name: string]: PropertyMetadata}
) {
    var metadata = new ModelMetadata({kind: kind});
    metadata.contribute(type, Immutable.Map<string,PropertyMetadata>(properties));
    return metadata;
}

function modelMetadataTests() {
    describe('ModelMetadata', () => {
        it('should throw when trying to create a ModelMetadata with an invalid `kind`', () => {
            expect(() => new ModelMetadata({kind: 'test'})).toThrow();
            expect(() => new ModelMetadata({kind: 'test::MyModel'})).not.toThrow();
        });

        it('should be possible to check whether the model has a given property', () => {
            class Foo {}
            var metadata = _mkModelMetadata('test::MyModel', Foo, {
                'a': new PropertyMetadata({codec: identity})
            });

            expect(() => metadata.checkHasProperty('a')).not.toThrow();
            expect(() => metadata.checkHasProperty('b')).toThrow();
        });
    });
}

function propertyMetadataTests() {
    describe('PropertyMetadata', () => {
        it('should not be possible to contribute a reserved name to a property', () => {
            var property = new PropertyMetadata({codec: identity});
            for (let name of ['kind', 'metadata', 'get', 'set', 'delete']) {
                expect(() => property.contribute(name)).toThrow();
            }
            expect(() => property.contribute('a')).not.toThrow();
        })
    });
}
