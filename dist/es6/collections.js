import { List, Set } from 'immutable';
import { compose } from "./codec";
export function array(codec) {
    return {
        encode: (input, context) => input.map((item) => codec.encode(item, context)),
        decode: (input, context) => input.map((item) => codec.decode(item, context))
    };
}
const listToArray = {
    encode: (input) => input.toArray(),
    decode: (input) => List(input)
};
export function list(codec) {
    return compose(listToArray, array(codec));
}
const setToArray = {
    encode: (input) => input.toArray(),
    decode: (input) => Set(input)
};
export function set(codec) {
    return compose(setToArray, array(codec));
}
export function dict(codec) {
    return {
        encode: (input, context) => input.map((value) => codec.encode(value, context)).toMap(),
        decode: (input, context) => input.map((value) => codec.decode(value, context)).toMap()
    };
}
