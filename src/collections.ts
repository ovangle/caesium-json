import {List, Map, Record, Set} from 'immutable';
import {Codec, compose, isCodec} from "./codec";
import {identifier, IdentifierFormat} from "./identifier";
import {objectKeys} from "./utils";
import {Json, JsonObject} from "./json";

export function array<T,U>(codec: Codec<T,U>): Codec<Array<T>,Array<U>> {
  return {
    encode: (input: Array<T>, context?: any) => input.map((item) => codec.encode(item, context)),
    decode: (input: Array<U>, context?: any) => input.map((item) => codec.decode(item, context))
  }
}

const listToArray: Codec<List<any>,Array<any>> = {
  encode: (input) => input.toArray(),
  decode: (input) => List(input)
}

export function list<T,U>(codec: Codec<T,U>): Codec<List<T>, Array<U>> {
  return compose(listToArray, array(codec));
}

const setToArray: Codec<Set<any>,Array<any>> = {
  encode: (input) => input.toArray(),
  decode: (input) => Set(input)
}

export function set<T,U>(codec: Codec<T,U>): Codec<Set<T>,Array<U>> {
  return compose(setToArray, array(codec));
}

export function dict<K, V1, V2>(codec: Codec<V1,V2>): Codec<Map<K,V1>,Map<K,V2>> {
  return {
    encode: (input, context?: any) => input.map((value) => codec.encode(value, context)).toMap(),
    decode: (input, context?: any) => input.map((value) => codec.decode(value, context)).toMap()
  }
}

