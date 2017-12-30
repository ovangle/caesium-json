import {List, Map, Record, Set} from 'immutable';
import {Codec, compose, identity, isCodec, invert, error, contextValue} from "./codec";
import {nullable} from './nullable';

export {
  Codec,
  compose,
  identity,
  isCodec,
  invert,
  error,
  nullable,
  contextValue
}

export {
  Json,
  JsonPrimitive,
  JsonArray,
  JsonObject,
} from './json';

import {bool, num, str, date} from './json';
import {array, list, object, map, record, set} from './collections';


export const json = {
  bool,
  num,
  str,

  date,

  array,
  list,
  object,
  map,
  record,
  set,

  nullable
};

export {
  PrivacyLevel,
  Word,
  Identifier,
  IdentifierFormat,
  identifier,
  rewriteObjectIdentifiers
} from './identifier';

import {Identifier} from './identifier';
import {upperCamelCase, lowerCamelCase, snakeCase, underscoreCase} from './identifier-formats';

export const identifierFormats = {
  upperCamelCase,
  lowerCamelCase,
  underscoreCase
}








