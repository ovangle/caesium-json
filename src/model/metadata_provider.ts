import {List, Set, Map} from 'immutable';

import {Injectable, Inject, Provider, OpaqueToken} from '@angular/core';
import {Type, isDefined, isFunction} from 'caesium-core/lang';

import {ModelNotFoundException, InvalidMetadata} from './exceptions';
import {ModelMetadata} from './metadata';

export const TYPE_METADATA = new OpaqueToken('cs_type_metadata');
export const SUBTYPE_METADATA = new OpaqueToken('cs_subtype_metadata');

export interface AbstractTypeConfig {
    type: Type<any>;

    subtypes: Type<any>[];
}

function provideType(type: Type<any> | AbstractTypeConfig): Provider[] {
    if (isFunction(type)) {
        let metadata = ModelMetadata.forType(<Type<any>>type);
        metadata.checkValid();
        return [{provide: TYPE_METADATA, useValue: metadata, multi: true}];
    }

    let abstractType = <AbstractTypeConfig>type;
    let subtypeMetadatas = Set<Type<any>>(abstractType.subtypes)
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

export function provideTypeMetadata(types: (Type<any> | AbstractTypeConfig)[]): Provider[] {
    return List<Type<any> | AbstractTypeConfig>(types).flatMap<number,Provider>(provideType).toArray();
}

@Injectable()
export class MetadataProvider {

    private _map: Map<Type<any>,ModelMetadata>;
    private _leafMap: Map<Type<any>, Set<ModelMetadata>>;

    constructor(
        @Inject(TYPE_METADATA) metadatas: ModelMetadata/*<? extends ManagedModel>*/[],
        @Inject(SUBTYPE_METADATA) subtypeMetadatas: [Type<any>, Set<ModelMetadata>][]
    ) {
        this._map = metadatas.reduce(
            (acc, metadata) => acc.set(metadata.type, metadata),
            Map<Type<any>,ModelMetadata>()
        );

        this._leafMap = subtypeMetadatas.reduce(
            (acc, [abstractType, leafTypes]) => acc.set(abstractType, leafTypes.toSet()),
            Map<Type<any>, Set<ModelMetadata>>()
        );
    }

    for<T>(objOrType: Type<T> | T): ModelMetadata /*<T>*/ {
        return isFunction(objOrType)
            ? this.forType(<Type<T>>objOrType)
            : this.forType(Object.getPrototypeOf(objOrType).constructor);
    }


    /**
     * Gets the metadata which was provided for the type (or subtype).
     *
     * @param type
     */
    private forType<T>(type: Type<T>): ModelMetadata {
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
    leafMetadatasForType<T>(type: Type<T>): Set<ModelMetadata/*<? extends T>*/> {
        return this._leafMap.get(type, Set<ModelMetadata>());
    }

}
