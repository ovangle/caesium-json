import {Map} from 'immutable';
import {Type, forEachOwnProperty} from 'caesium-core/lang';

import {reflector} from 'angular2/src/core/reflection/reflection';
import {resolveForwardRef} from 'angular2/src/core/di';
import {ModelMetadata, PropertyMetadata, RefPropertyMetadata} from './metadata';
import {ModelResolutionError} from "./../exceptions";

export interface Resolver<T> {
    resolve(type: Type): T;
}


class ModelResolver implements Resolver<ModelMetadata> {
    private _resolved: WeakMap<Type,ModelMetadata>;

    constructor() {
        this._resolved = new WeakMap<Type, ModelMetadata>();
    }

    resolve(type: Type) {
        if (!this._resolved.has(type)) {
            this._resolved.set(type, _resolveModelMetadata(type));
        }
        return this._resolved.get(type);
    }

}

function _resolveModelMetadata(type: Type): ModelMetadata {
    var typeMetadata = reflector.annotations(resolveForwardRef(type));

    var metadata = typeMetadata.find((metadata) => metadata instanceof ModelMetadata);

    if (metadata) {
        var propMetadata = _resolvePropertyMetadata(type);
        metadata.contribute(type, propMetadata);
        return metadata;
    }
    throw new ModelResolutionError(`No @Model annotations found on ${type}`);
}

function _resolvePropertyMetadata(type: Type): Map<string,PropertyMetadata> {
    var propMetadata = reflector.propMetadata(type);
    var ownProperties: Array<[string, PropertyMetadata]> = [];
    forEachOwnProperty(propMetadata, (value, attr) => {
        var propMetadata = value.find(
            (meta: any) => meta instanceof PropertyMetadata
                        || meta instanceof RefPropertyMetadata
        );
        if (propMetadata)
            ownProperties.push([attr, propMetadata]);
    });
    return Map<string,PropertyMetadata>(ownProperties);
}

export const modelResolver: Resolver<ModelMetadata> = new ModelResolver();


