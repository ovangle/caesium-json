//TODO: We should redefine these in 'utils'.
//We shouldn't be relying on internal angular2 implementation details.

import {Type} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';


import {ModelConstructor} from './factory';
import {modelTypeProxy} from './type_proxy';

/// The options are
export interface ModelOptions {
    kind: string;
    superType?: Type;
    isAbstract?: boolean;

    /**
     * Function which takes an encoded instance of the type and
     * returns the appropriate subtype of the model.
     *
     * Only needs to be provided for abstract models.
     *
     * @param obj
     */
    selectSubtype?: (obj: any) => Type;
}

export function Model(options: ModelOptions): (cls: any) => any {
    if (!(Reflect && Reflect.getMetadata)) {
        throw 'reflect-metadata shim is required when using model decorators';
    }
    function model(type: Type) {
        //debugger;
        Reflect.defineMetadata('model:options', options, type);

        if (!Reflect.hasMetadata('model:properties', type)) {
            Reflect.defineMetadata('model:properties', [], type);
        }
        return modelTypeProxy(type);
    }
    return model;
}

export interface BasePropertyOptions {
    writeOnly?: boolean;
    readOnly?: boolean;
    required?: boolean;
    allowNull?: boolean;
    isMulti?: boolean;

    default?: any | (() => any);
}

export const defaultBasePropertyOptions: BasePropertyOptions = {
    writeOnly: false,
    readOnly: false,
    required: true,
    allowNull: false,
    isMulti: false
};

export interface PropertyOptions extends BasePropertyOptions {
    /**
     * Is the property the unique identifier of the model.
     * Must be of type `String` or `Number`
     * There can only be at most one key property on a model.
     *
     * The following attributes are always `true` for key properties, irrespective of the value
     * set on the decorator
     *  - required
     *  - allowNull
     *  - default (default is always `null`)
     */
    key?: boolean;
    codec: Codec<any,any>;
    isMulti?: boolean;
}

export const defaultPropertyOptions: PropertyOptions = Object.assign({}, defaultBasePropertyOptions, {
    defaultValue: () => null,
    codec: undefined,
    isMulti: false
});

function _definePropertyMetadata(name: string, options: BasePropertyOptions, isRef: boolean) {
    return function (type: Type, _: null, index: number) {
        let paramTypes: Type[] = Reflect.getMetadata('design:paramtypes', type);

        let properties: any[];
        if (Reflect.hasMetadata('model:properties', type)) {
            properties = Reflect.getMetadata('model:properties', type);
        } else {
            // There will be as many arguments as parameter types.
            // We don't want to error here though.
            properties = paramTypes.map(_ => null);
        }

        properties[index] = {isRef: isRef, args: [type, name, paramTypes[index], options]};
        Reflect.defineMetadata('model:properties', properties, type);
    }
}


export function Property(name: string, options?: PropertyOptions) {
    options = Object.assign({}, defaultPropertyOptions, options);
    return _definePropertyMetadata(name, options, false);
}

export interface RefPropertyOptions {
    refName: string;
    refType: Type;
    isMulti?: boolean;
}

export const defaultRefPropertyOptions: RefPropertyOptions = Object.assign({}, defaultBasePropertyOptions, {
    refName: undefined,
    refType: undefined,
    isMulti: false
});

export function RefProperty(name: string, options?: RefPropertyOptions) {
    options = Object.assign({}, defaultRefPropertyOptions, options);
    return _definePropertyMetadata(name, options, true);
}


