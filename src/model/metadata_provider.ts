import {List, Set, Map} from 'immutable';

import {Injectable, Inject, Provider, OpaqueToken} from '@angular/core';
import {Type, isDefined, isFunction} from 'caesium-core/lang';

import {ModelNotFoundException, InvalidMetadata} from './exceptions';
import {ModelMetadata} from './metadata';

export const TYPE_METADATA = new OpaqueToken('cs_type_metadata');
export const SUBTYPE_METADATA = new OpaqueToken('cs_subtype_metadata');

export interface AbstractTypeConfig {
    type: Type;

    subtypes: Type[];
}

function provideType(type: Type | AbstractTypeConfig): Provider[] {
    if (isFunction(type)) {
        let metadata = ModelMetadata.forType(<Type>type);
        metadata.checkValid();
        return [{provide: TYPE_METADATA, useValue: metadata, multi: true}];
    }

    let abstractType = <AbstractTypeConfig>type;
    let subtypeMetadatas = Set<Type>(abstractType.subtypes)
        .map((subtype) => {
            let metadata = ModelMetadata.forType(subtype);
            metadata.checkValid();
            return metadata;
        })
        .toSet();
    return [
        ...provideType(abstractType.type),
        {provide: SUBTYPE_METADATA, useValue: [abstractType.type, subtypeMetadatas], multi: true}
    ]

}

export function provideTypeMetadata(types: (Type | AbstractTypeConfig)[]): Provider[] {
    return List<Type | AbstractTypeConfig>(types).flatMap<number,Provider>(provideType).toArray();
}

@Injectable()
export class MetadataProvider {

    private _map: Map<Type,ModelMetadata>;
    private _leafMap: Map<Type, Set<ModelMetadata>>;

    constructor(
        @Inject(TYPE_METADATA) metadatas: ModelMetadata/*<? extends ManagedModel>*/[],
        @Inject(SUBTYPE_METADATA) subtypeMetadatas: [Type, Set<ModelMetadata>][]
    ) {
        this._map = metadatas.reduce(
            (acc, metadata) => acc.set(metadata.type, metadata),
            Map<Type,ModelMetadata>()
        );

        this._leafMap = subtypeMetadatas.reduce(
            (acc, [abstractType, leafTypes]) => acc.set(abstractType, leafTypes.toSet()),
            Map<Type, Set<ModelMetadata>>()
        );
    }

    for<T>(objOrType: Type /*<T>*/ | T): ModelMetadata /*<T>*/ {
        return isFunction(objOrType)
            ? this.forType(<Type/*<T>*/>objOrType)
            : this.forType(Object.getPrototypeOf(objOrType).constructor);
    }


    /**
     * Gets the metadata which was provided for the type (or subtype).
     *
     * @param type
     */
    private forType<T>(type: Type /*<T>*/): ModelMetadata {
        let metadata: ModelMetadata;
        do {
            metadata = ModelMetadata.forType(type);
            if (this._map.has(type)) {
                return metadata;
            }
            type = metadata.superType;
        } while (isDefined(metadata.superType));
        throw new ModelNotFoundException(type);
    }

    /**
     * Get all model metadatas which are assignable to the given type.
     * @param type
     */
    leafMetadatasForType<T>(type: Type/*<T>*/): Set<ModelMetadata/*<? extends T>*/> {
        return this._leafMap.get(type, Set<ModelMetadata>());
    }

}
