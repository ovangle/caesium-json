# Changelog

## 1.0.0-alpha.1

- Export 'contextValue' from index
- Improved type declarations
- JsonObject is now a parameterised type
- Added `partialObject` codec


## 1.0.0-alpha.0

- Added optional `context` argument to `Codec.encode` and `Codec.decode`
- Added `contextValue` codec
    - On encode, writes all inputs to `undefined`
    - On decode, reads the value from the provided context.
- Moved `nullable` codec to it's own module.
- Split `json` module into `json` and `collections` modules
    - `json` module defines interfaces and codecs for json primitives (num, str, bool, date)
    - `collections` defines `array`, `list`, `map` codecs
- Removed `json.model` codec
- Added `collections.object`, `collections.record`, `collections.set` codecs
    - `collections.set` behaves like `collections.list`, except encoding to/from `Immutable.Set`
    - `collections.object` encodes an arbitrary javascript object by using the key in the provided `codecs`
    - `collections.record` behaves like old `json.model`, except it does not encode object keys.
      Compose with `identifier.rewriteObjectIdentifiers` to obtain the old behaviour
- Split `identifiers` module into `identifier` and `identifier-formats`
    - `identifier` defines interfaces and utility functions
    - `identifier-formats` defines common js and css identifier formats
- Added `identifier.rewriteObjectIdentifier` codec
  Encode the keys of an object using the given source and destination formats

## 0.3.0

Complete rewrite of `caesium-model` library.

Library concerned with serialization of `Immutable.Record`-like objects to/from json.

Renamed npm package to 'caesium-json'




## 0.2.4

Upgrade peer dependency caesium-core to 0.2.0

## 0.2.1, 0.2.2, 0.2.3
Fixes to imports to make modules load correctly when imported

## 0.2.0

### Features
- Removed es6-shim dependency
- Added Models module for support of @angular-2.0.0

#### model

- Added model references
    Models can now define `@RefProperty` attributes, which can be used as foreign
    keys to other models.
- Support for abstract model types
    Models can now be annotated as `'isAbstract: true'`, to provide better support
    for inheritance between models
- Can now pass an immutable value to PropertyOptions.default
- Removed 'ManagerBase.resolveProperty' method, moving it to `ModelManager`


#### json_codecs

- Added `enumToString` codec to the `json_codecs` module
- Added `recordToJson` codec to the `json_codecs` module
- All models now have an `id` property
    The id can be of any type as long as it can be encoded using an identity codec.

#### Manager
- Renamed ManagerBase to ModelManager, and removed ManagerOptions dependency.
  If methods which extend the manager base are needed, Manager can still be
- Replaced manager.request module with manager.http module, improving the experience
  for working with managed models.
- Added ModelManager.save method, which
    - POSTs the model to <managerPath>/create if the id is `null`
    - PUTs the model to <managerPath>/<modelId> if the id is present.
- Added ModelManager.resolve method, which fetches the value of a given foreign key.

### Bugfixes
- Factory created model instances now inherit methods defined on the model
- JsonObject, JsonQuery, Codec, Converter, identity now exported from json_codecs module
- onData, thisArg removed from ResponseHandler and thisArg added to BaseResponseHandler
- Fixed ModelManager resolution error
- Removed dependency on Angular internals


### Breaking changes
- Removed ModelManager.create method
- New model definition API.
- Now requires Native (not transpiled) ES6 Proxy
- Upgraded @angular/ dependencies to ^2.0.0
- search parameters are automatically converted to snake_case from camelCase
  All multi-word parameters need to be changed to camelCase

- No longer exports an 'exceptions' subpackage.
- readOnly properties are no longer coerced to `null`
- ID is no longer a requred property
- Removed old ModelHttp, Request (and related) and Resposne classes
- Added Request class, with directly streaming observable interfaces.

#### manager
- Manager is no longer exported from model
- Remove ModelManager.create method
- Remove ModelManager.getAllByReferenceMethod
- Manager now has no decorator
- Any models which are base types for other models must be annotated with `isAbstract: true`


## 0.1.0
Breaking changes
Complete refactor of http/ interfaces. Refer to code for details

