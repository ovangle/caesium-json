import {List, Map} from 'immutable';
import {Codec} from '../codec';

import {assertNotNull, nullSafeIdentity} from '../utils';

export const str: Codec<string,string> = nullSafeIdentity;
export const num: Codec<number,number> = nullSafeIdentity;
export const bool: Codec<boolean,boolean> = nullSafeIdentity;

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
