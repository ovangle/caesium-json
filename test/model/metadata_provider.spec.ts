import {Set} from 'immutable';
import {TestBed, inject} from '@angular/core/testing';

import {Type} from 'caesium-core/lang';

import {ModelMetadata} from '../../src/model/metadata';
import {MetadataProvider, provideTypeMetadata, TYPE_METADATA, SUBTYPE_METADATA} from '../../src/model/metadata_provider';

import * as Test from './models';

describe('model.metadata_provider', () => {
    describe('MetadataProvider', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    provideTypeMetadata([
                        Test.ModelNoProperties,
                        {type: Test.ModelSupertype, subtypes: [Test.ModelSubtype]}
                    ]),
                    MetadataProvider
                ],
            })

        });

        it('should provide values for the TYPE_METADATA token', inject(
            [TYPE_METADATA],
            (typeMetadata: ModelMetadata[]) => {
                expect(typeMetadata).toEqual([
                    ModelMetadata.forType(Test.ModelNoProperties),
                    ModelMetadata.forType(Test.ModelSupertype)
                ]);
            }
        ));

        it('should provide values for the SUBTYPE_METADATA token', inject(
            [SUBTYPE_METADATA],
            (subtypeMetadata: ([Type, Set<ModelMetadata>][])) => {
                expect(subtypeMetadata).toEqual([
                    [Test.ModelSupertype, Set([ModelMetadata.forType(Test.ModelSubtype)])]
                ])
            })
        );

        it('should be possible to get the metadata of Test.ModelNoProperties', inject(
            [MetadataProvider],
            (provider: MetadataProvider) => {
                let modelNoProperties = ModelMetadata.forType(Test.ModelNoProperties);
                expect(provider.for(Test.ModelNoProperties)).toBe(modelNoProperties, 'should obtain metadata for types');
                expect(provider.for(new Test.ModelNoProperties(null))).toBe(modelNoProperties, 'should obtain metadata for instances');
            }
        ));

        it('should provide the metadata for the supertype when passed the subtype', inject(
            [MetadataProvider],
            (provider: MetadataProvider) => {
                let modelSupertype = ModelMetadata.forType(Test.ModelSupertype);
                expect(provider.for(Test.ModelSubtype)).toBe(modelSupertype, 'Should provide the supertype metadata');
                expect(provider.leafMetadatasForType(Test.ModelSupertype).toArray())
                    .toEqual([ModelMetadata.forType(Test.ModelSubtype)]);
            })
        );
    });
})

