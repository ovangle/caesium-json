import { Codec } from 'caesium-core/codec';
/**
 * Codec between string representing a calendar date with no time information.
 *
 * It is assumed that the date passed from the server represents UTC midnight
 * on the specified day.
 *
 * @type {{encode: ((date:Date)=>(any|string)); decode: ((value:string)=>(any|Date))}}
 */
export declare const date: Codec<Date, string>;
export declare const dateTime: Codec<Date, string>;
