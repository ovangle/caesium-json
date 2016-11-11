# Changelog


## 0.2.0

### Features
- Removed es6-shim dependency
- Added model references
    Models can now define `@RefProperty` attributes, which can be used as foreign
    keys to other models.
- Support for abstract model types
    Models can now be annotated as `'isAbstract: true'`, to provide better support
    for inheritance between models

- Added `enumToString` codec to the `json_codecs` module
- Added `recordToJson` codec to the `json_codecs` module
- All models now have an `id` property
    The id can be of any type as long as it can be encoded using an identity codec.

### Bugfixes
- Factory created model instances now inherit methods defined on the model
- JsonObject, JsonQuery, Codec, Converter, identity now exported from json_codecs module
- onData, thisArg removed from ResponseHandler and thisArg added to BaseResponseHandler
- Fixed ModelManager resolution error
- Removed dependency on Angular internals


## Breaking changes
- New model definition API.
- Now requires Native (not transpiled) ES6 Proxy
- Upgraded @angular/ dependencies to ^2.0.0
- search parameters are automatically converted to snake_case from camelCase
  All multi-word parameters need to be changed to camelCase

- Another huge refactor of http. Renamed 'http' package to 'manager'
- Manager is no longer exported from model
- Manager now has no decorator
- Any models which are base types for other models must be annotated with `isAbstract: true`



## 0.1.0
Breaking changes
Complete refactor of http/ interfaces. Refer to code for details

