# caesium-json

Utilities for encoding simple javascript objects to/from json.
It is intended for libraries which make liberal use of either the [immutable.js](1),
or with plain javascript objects.

Often, the format of a publicly accessable API produces objects
which need to be marshalled into and out of the models of the application

## Codec

A codec is a pair of functions, `encode` and `decode` which satisfy
the conditions:

-- `decode(encode(x)) === x`
-- `encode(decode(x)) === x`

## Json

The library considers instances of the following types to be valid json:

- `null`
- `boolean`
- `number`
- `string`
- `date`
- `Array<Json>`
- `{[key: string]: Json}`

The library defines a codec for each primitive json
types (except `null`), and the utilities for converting
javascript objects to/from arrays are available through the
`collections` module.

By default, all defined codecs error on `null` value. If `null`
values can be accepted as value, then the codec can be "lifted"
to a nullable type using the `nullable` codec.

## Collections

Codecs for various common collection types:

### `collections.array(itemCodec)`

The most basic of javascript collection types









