import { Codec } from './codec';
export declare function assertNotNull(value: any): void;
export declare const nullSafeIdentity: Codec<any, any>;
export declare function objectKeys<T>(obj: T): (keyof T)[];
