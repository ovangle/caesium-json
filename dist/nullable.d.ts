import { Codec } from 'caesium-core/codec';
/**
 * Turns a codec which does not accept blank values into a codec which does.
 */
export declare function nullable<T, U>(codec: Codec<T, U>): Codec<T | null, U | null>;
