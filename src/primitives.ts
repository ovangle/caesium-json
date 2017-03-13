import moment from 'moment';

import {List, Map} from 'immutable';
import {isBlank} from '../../caesium-core/lang';
import {Codec, identity, EncodingException} from '../../caesium-core/codec';

import {assertNotNull, nullSafeIdentity} from './utils';


export const str: Codec<string,string> = nullSafeIdentity;
export const num: Codec<number,number> = nullSafeIdentity;
export const bool: Codec<boolean,boolean> = nullSafeIdentity;
