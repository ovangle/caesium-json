import {Map} from 'immutable';
import {Type, forEachOwnProperty} from 'caesium-core/lang';

//TODO: Should not rely on internal @angular details
import {reflector} from '@angular/core/src/reflection/reflection';
import {resolveForwardRef} from '@angular/core';
import {ModelMetadata, BasePropertyMetadata} from './metadata';
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
        type = resolveForwardRef(type);
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

function _resolvePropertyMetadata(type: Type): Map<string,BasePropertyMetadata> {
    var propMetadata = reflector.propMetadata(type);
    var ownProperties: Array<[string, BasePropertyMetadata]> = [];
    forEachOwnProperty(propMetadata, (value, attr) => {
        var propMetadata = value.find((meta: any) => meta instanceof BasePropertyMetadata);
        if (propMetadata)
            ownProperties.push([attr, propMetadata]);
    });
    return Map<string,BasePropertyMetadata>(ownProperties);
}

export const modelResolver: Resolver<ModelMetadata> = new ModelResolver();


