//TODO: We should redefine these in 'utils'.
//We shouldn't be relying on internal angular2 implementation details.

//TODO: We really need to come up with our own definitions for these
// We shouldn't be relying on angular implementation details.
import {makeDecorator, makePropDecorator, TypeDecorator} from '@angular/core/src/util/decorators';
import {Type} from 'caesium-core/lang';
import {Codec} from 'caesium-core/codec';
import {JsonObject} from '../json_codecs';

import {
    ModelMetadata, PropertyMetadata, PropertyOptions, RefPropertyOptions,
    RefPropertyMetadata, BackRefPropertyOptions, BackRefPropertyMetadata
} from './metadata';

import {createModelFactory} from './factory';

export interface ModelOptions {
    kind: string;
    superType?: Type;
    isAbstract?: boolean;
}

export interface ModelConstructor<T> {
    (...args: any[]): T;
}

export function Model(options?: ModelOptions) {
    //console.log('Options', options);
    function model(constructor: Function) {

        //console.log('Constructor', constructor);
        return constructor();
    }
    return model;
}

export interface BasePropertyOptions {
    writeOnly?: boolean;
    readOnly?: boolean;
    required?: boolean;
    allowNull?: boolean;

    // TODO: clientOnly?: boolean;
}

export interface PropertyOptions {
    // TODO: initial: T
    defaultValue: () => any;
    codec: Codec<any,JsonObject>;
    // TODO: validators: ValidatorFn<T>[]
}

export function Property(options?: PropertyOptions) {
    return function (target: Object, propName: string | symbol){
        let metadata = new PropertyMetadata(options);

        /*
        console.log('Property');
        console.log('\tTarget: ', target);
        console.log('\tProperty name', propName);
        */
    }
}

export interface RefPropertyOptions {
    refName: string;
    refType: Type;

}

export function RefProperty(options?: RefPropertyOptions) {
    return function (target: Object, propName: string | symbol) {
        let metadata = new RefPropertyMetadata(options);
        /*
        console.log('RefProperty');
        console.log('\tTarget: ', target);
        console.log('\tProperty name', propName);
        */

    }
}

