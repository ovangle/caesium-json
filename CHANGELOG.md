# Changelog

## 0.3.0

### Bugfixes
- `ModelMetadata.forType` can now be called with a forward refs
- `RequestFactory.apiHostHref` was not being set in all cases
- Set Content-Type header on all outgoing requests

### Dependencies
- `caesium-core` dependency upgraded to `^0.3.0`

### Breaking changes
#### Miscelaneous
- No longer exports `*.ts` files with package



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

