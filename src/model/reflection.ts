import {Type, forEachOwnProperty} from 'caesium-core/lang';

import {reflector} from 'angular2/src/core/reflection/reflection';
import {resolveForwardRef} from 'angular2/src/core/di';
import {ManagerMetadata, ModelMetadata, PropertyMetadata} from './metadata';
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

function _resolvePropertyMetadata(type: Type): Immutable.Map<string,PropertyMetadata> {
    var propMetadata = reflector.propMetadata(type);
    var ownProperties: Array<[string, PropertyMetadata]> = [];
    forEachOwnProperty(propMetadata, (value, attr) => {
        var propMetadata = value.find((meta: any) => meta instanceof PropertyMetadata);
        propMetadata.contribute(attr);
        ownProperties.push([attr, propMetadata]);
    });
    return Immutable.Map<string,PropertyMetadata>(ownProperties);
}



class ManagerResolver implements Resolver<ManagerMetadata> {
    private _resolved: WeakMap<Type,ManagerMetadata>;

    constructor() {
        this._resolved = new WeakMap<Type, ManagerMetadata>();
    }

    resolve(type: Type) {
        if (!this._resolved.has(type)) {
            this._resolved.set(type, _resolveManagerMetadata(type));
        }
        return this._resolved.get(type);
    }
}

function _resolveManagerMetadata(type: Type): ManagerMetadata {
    var typeMetadata = reflector.annotations(resolveForwardRef(type));

    var metadata = typeMetadata.find((metadata) => metadata instanceof ManagerMetadata);

    if (metadata) {
        return metadata;
    }
    throw new ModelResolutionError(`No @Manager annotations found on ${type}`);
}

export const modelResolver: Resolver<ModelMetadata> = new ModelResolver();
export const managerResolver: Resolver<ManagerMetadata> = new ManagerResolver();


