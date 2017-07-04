import { ModelOptions, PropertyOptions, RefPropertyOptions } from './metadata';
export declare function Model(options: ModelOptions): ClassDecorator;
export declare function Property<T>(options: PropertyOptions): PropertyDecorator;
export declare function RefProperty<T>(options: RefPropertyOptions): PropertyDecorator;
