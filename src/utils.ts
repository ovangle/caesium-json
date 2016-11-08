

export const Type = Function;

export interface Type<T> extends Function {
    new (...args: any[]): T;
}

export interface ClassDefinition {
    extends?: Type<any>;

    constructor: Function|any[];

    [x: string]: Type<any>|Function|any[];
}

export interface TypeDecorator {
    <T extends Type<any>>(type: T): T;
    (target: Object, propertyKey?: string|symbol, parameterIndex?: number): void;

    annotations: any[];

    Class(obj: ClassDefinition): Type<any>;

}
