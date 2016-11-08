import {Map} from 'immutable';
import {Type, forEachOwnProperty} from 'caesium-core/lang';

import {resolveForwardRef} from '@angular/core';
import {ModelMetadata, BasePropertyMetadata} from './metadata';
import {ModelResolutionError} from "./../exceptions";

const reflector: any = {};

export interface ModelResolver {
    resolve(type: Type): ModelMetadata;
}

class _ModelResolver implements ModelResolver {
    private _resolved: WeakMap<Type,ModelMetadata>;

    constructor() {
        this._resolved = new WeakMap<Type, ModelMetadata>();
    }

    resolve(type: Type): ModelMetadata {
        type = resolveForwardRef(type);
        if (!this._resolved.has(type)) {
            this._resolved.set(type, _resolveModelMetadata(type));
        }
        return this._resolved.get(type);
    }

}

function _resolveModelMetadata(type: any): ModelMetadata {
    if (!(Reflect && Reflect.getMetadata)) {
        throw 'The reflect-metadata shim must be included before using model decorators';
    }

    var typeMetadata = reflector.annotations(type);

    var metadata: ModelMetadata = typeMetadata.find((metadata: any) => metadata instanceof ModelMetadata);

    if (metadata) {
        var propMetadata = _resolvePropertyMetadata(type);
        metadata.contribute(type, propMetadata);
        return metadata;
    }
    throw new ModelResolutionError(`No @Model annotations found on ${type}`);
}

function _resolvePropertyMetadata(type: Type): Map<string,BasePropertyMetadata> {
    var propMetadata = reflector.propMetadata(type as any);
    var ownProperties: Array<[string, BasePropertyMetadata]> = [];
    forEachOwnProperty(propMetadata, (value, attr) => {
        var propMetadata = value.find((meta: any) => meta instanceof BasePropertyMetadata);
        if (propMetadata)
            ownProperties.push([attr, propMetadata]);
    });
    return Map<string,BasePropertyMetadata>(ownProperties);
}

export const modelResolver: ModelResolver= new _ModelResolver();


