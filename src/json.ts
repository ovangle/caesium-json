import {assertNotNull, nullSafeIdentity} from "./utils";
import {Codec} from "./codec";

export type Json = boolean | number | string | any[] | {[k: string]: any};

export type JsonPrimitive = boolean | number | string;
export type JsonObject = {[prop: string]: Json | null};
export type JsonArray  = Array<Json>;


export const bool: Codec<boolean,boolean> = nullSafeIdentity;
export const num: Codec<number,number> = nullSafeIdentity;
export const str: Codec<string,string> = nullSafeIdentity;

export const date: Codec<Date,string> = {
  encode: (date: Date) => {
    assertNotNull(date);
    return date.toISOString();
  },
  decode: (value: string) => {
    assertNotNull(value);
    let d = new Date(value);
    if (Number.isNaN(d.valueOf())) {
      throw new Error(`Not a valid date: '${value}'`);
    }
    return d;
  }
};

