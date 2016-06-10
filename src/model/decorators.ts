//TODO: We should redefine these in 'utils'.
//We shouldn't be relying on internal angular2 implementation details.

//TODO: We really need to come up with our own definitions for these
// We shouldn't be relying on angular implementation details.
import {makeDecorator, makePropDecorator, TypeDecorator} from '@angular/core/src/util/decorators';
import {Type} from 'caesium-core/lang';

import {
    ModelMetadata, PropertyMetadata, PropertyOptions, RefPropertyOptions,
    RefPropertyMetadata, BackRefPropertyOptions, BackRefPropertyMetadata
} from './metadata';

export interface ModelFactory {
    (obj: {
        kind: string,
        superType?: Type,
        isAbstract?: boolean
    }): TypeDecorator;
    new (obj: {
        kind: string,
        superType?: Type,
        isAbstract?: boolean
    }): ModelMetadata;
}

export interface PropertyFactory {
    (obj: PropertyOptions): any;
    new (obj: PropertyOptions): PropertyMetadata;
}

export interface RefPropertyFactory {
    (obj: RefPropertyOptions): any;
    new (obj: RefPropertyOptions): RefPropertyMetadata;
}

export interface BackRefPropertyFactory {
    (obj: BackRefPropertyOptions): any;
    new (obj: BackRefPropertyOptions): BackRefPropertyMetadata;
}


export const Model: ModelFactory =
    <ModelFactory>makeDecorator(ModelMetadata);

//FIXME: makePropDecorator prevents upgrading to --target ES6
//makePropDecorator assumes that PropertyMetadata is a function, because ES6 classes
//require the use of the `new` keyword. Target ES5 compiles typescript classes to functions.
export const Property: PropertyFactory =
    <PropertyFactory>makePropDecorator(PropertyMetadata);

export const RefProperty: RefPropertyFactory =
    <RefPropertyFactory>makePropDecorator(RefPropertyMetadata);

export const BackRefProperty: BackRefPropertyFactory = 
    <BackRefPropertyFactory>makePropDecorator(BackRefPropertyMetadata);
