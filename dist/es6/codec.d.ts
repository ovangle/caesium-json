export interface Codec<T, U> {
    encode(input: T, context?: any): U;
    decode(input: U, context?: any): T;
}
export declare function isCodec(obj: any): obj is Codec<any, any>;
export declare function invert<T1, T2>(codec: Codec<T1, T2>): Codec<T2, T1>;
export declare function compose<T1, T2>(a: Codec<T1, T2>): Codec<T1, T2>;
export declare function compose<T1, T2, T3>(a: Codec<T1, T2>, b: Codec<T2, T3>): Codec<T1, T3>;
export declare function compose<T1, T2, T3, T4>(a: Codec<T1, T2>, b: Codec<T2, T3>, c: Codec<T3, T4>): Codec<T1, T4>;
export declare function compose<T1, T2, T3, T4, T5>(a: Codec<T1, T2>, b: Codec<T2, T3>, c: Codec<T3, T4>, d: Codec<T4, T5>): Codec<T1, T5>;
export declare function compose<T1, T2, T3, T4, T5, T6>(a: Codec<T1, T2>, b: Codec<T2, T3>, c: Codec<T3, T4>, d: Codec<T4, T5>, e: Codec<T5, T6>): Codec<T1, T6>;
export declare function identity<T>(): Codec<T, T>;
/**
 * Uses the value stored in the context as identifier
 * in order to supply a codecs value.
 *
 * On encode, the input's value is written to the context identifier,
 * mutating the context.
 *
 * On decode, a value is read from the context.
 * If the contextual value is a function, it is called with no arguments
 * in order to generate a value for the field.
 *
 * @param {string} identifier
 * @returns {Codec<T, undefined>}
 */
export declare function contextValue<T>(identifier: string): Codec<T, undefined>;
/**
 * Codec which bottoms out with an exception on encode and decode.
 * @type {{encode: ((_) => any); decode: ((_) => any)}}
 */
export declare const error: Codec<any, any>;
