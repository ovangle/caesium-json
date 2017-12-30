import { Codec } from "./codec";
export declare function nullable<T, U>(codec: Codec<T, U>): Codec<T | null, U | null>;
