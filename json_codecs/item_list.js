"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lang_1 = require("caesium-core/lang");
const exceptions_1 = require("../exceptions");
const basic_1 = require("./basic");
/**
 * Decodes an object of the form
 * {
 *  items: JsonObject[]
 * }
 *
 * into a List, using the given decoder
 */
function itemList(itemDecoder) {
    var listCodec = basic_1.list(itemDecoder);
    return {
        encode: (items) => ({ items: listCodec.encode(items) }),
        decode: (obj) => {
            if (lang_1.isBlank(obj)) {
                throw new exceptions_1.EncodingException('listCodec cannot decode `null` or `undefined`');
            }
            if (!Array.isArray(obj['items'])) {
                throw new exceptions_1.EncodingException('object must have an \'items\' array');
            }
            return listCodec.decode(obj['items']);
        }
    };
}
exports.itemList = itemList;
//# sourceMappingURL=item_list.js.map