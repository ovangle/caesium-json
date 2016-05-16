# Changelog

## 0.2.0

### Features
- Added model references
    Models can now define `@RefProperty` attributes, which can be used as foreign
    keys to other models.
- Added `enumToString` codec to the `json_codecs` module
- Added `recordToJson` codec to the `json_codecs` module
- All models now have an `id` property
    The id can be of any type as long as it can be encoded using an identity codec.

### Bugfixes
- Factory created model instances now inherit methods defined on the model
- JsonObject, JsonQuery, Codec, Converter, identity now exported from json_codecs module
- onData, thisArg removed from ResponseHandler and thisArg added to BaseResponseHandler
- Fixed ModelManager resolution error


## 0.1.0
Breaking changes
Complete refactor of http/ interfaces. Refer to code for details

