(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('immutable')) :
	typeof define === 'function' && define.amd ? define('index', ['exports', 'immutable'], factory) :
	(factory((global.index = global.index || {}),global.Immutable));
}(this, (function (exports,immutable) { 'use strict';

function invert(codec) {
    return {
        encode: input => codec.decode(input),
        decode: input => codec.encode(input)
    };
}
function compose(codec_a, codec_b) {
    return {
        encode: input => codec_b.encode(codec_a.encode(input)),
        decode: input => codec_a.decode(codec_b.decode(input))
    };
}


function nullable(codec) {
    return {
        encode: input => input != null ? codec.encode(input) : null,
        decode: input => input != null ? codec.decode(input) : null
    };
}
function array(codec) {
    return {
        encode: input => input.map(item => codec.encode(item)),
        decode: input => input.map(item => codec.decode(item))
    };
}
const listToArray = {
    encode: input => input.toArray(),
    decode: input => immutable.List(input)
};
function list(codec) {
    return compose(listToArray, array(codec));
}
function map(codec) {
    return {
        encode: input => input.map(codec.encode).toMap(),
        decode: input => input.map(codec.decode).toMap()
    };
}
/**
 * Codec which bottoms out with an exception on encode and decode.
 * @type {{encode: ((_) => any); decode: ((_) => any)}}
 */
const error = {
    encode: _ => {
        throw new Error('A codec was not provided');
    },
    decode: _ => {
        throw new Error('A codec was not provided');
    }
};

function assertNotNull(value) {
    if (value == null) throw new Error('Value cannot be null');
}
const nullSafeIdentity = {
    encode: input => {
        assertNotNull(input);
        return input;
    },
    decode: input => {
        assertNotNull(input);
        return input;
    }
};

const str = nullSafeIdentity;
const num = nullSafeIdentity;
const bool = nullSafeIdentity;
const date = {
    encode: date => {
        assertNotNull(date);
        return date.toISOString();
    },
    decode: value => {
        assertNotNull(value);
        let d = new Date(value);
        if (Number.isNaN(d.valueOf())) {
            throw new Error(`Not a valid date: '${value}'`);
        }
        return d;
    }
};

const propertyOptionDefaults = {
    required: true
};
function propertyCodec(prop) {
    if (Array.isArray(prop)) {
        return prop[0];
    } else {
        return prop;
    }
}
function propertyOptions(prop) {
    if (Array.isArray(prop)) {
        return prop[1];
    } else {
        return propertyOptionDefaults;
    }
}
class ModelCodec {
    constructor(type, properties, propKey) {
        this.type = type;
        this.properties = properties;
        this.propKey = propKey;
    }
    get typeName() {
        return this.type.name;
    }
    encode(model) {
        assertNotNull(model);
        return this.properties.mapEntries(([key, property]) => {
            const options = propertyOptions(property);
            const valueCodec = propertyCodec(property);
            const objKey = this.propKey.encode(key);
            const modelValue = model.get(key, undefined);
            if (modelValue === undefined) {
                if (options.required) throw new Error(`Required property '${key}' of '${this.typeName}' codec not present on model`);
                return [objKey, undefined];
            }
            return [objKey, valueCodec.encode(modelValue)];
        }).filter(v => v !== undefined).toObject();
    }
    decode(obj) {
        assertNotNull(obj);
        for (let key of Object.keys(obj)) {
            const modelKey = this.propKey.decode(key);
            if (!this.properties.has(modelKey)) throw new Error(`'${modelKey}' not found on '${this.typeName}' codec`);
        }
        const modelArgs = this.properties.mapEntries(([key, property]) => {
            const options = propertyOptions(property);
            const valueCodec = propertyCodec(property);
            const objKey = this.propKey.encode(key);
            const objValue = obj[objKey];
            if (objValue === undefined) {
                if (options.required) throw new Error(`Required property '${key}' of '${this.typeName}' codec not present on object`);
                return [key, undefined];
            }
            return [key, valueCodec.decode(objValue)];
        }).filter(v => v !== undefined).toObject();
        return new this.type(modelArgs);
    }
}
function model(type, properties, keyCodec) {
    return new ModelCodec(type, immutable.Map(properties), keyCodec || str);
}



var index = Object.freeze({
	list: list,
	map: map,
	nullable: nullable,
	num: num,
	str: str,
	bool: bool,
	date: date,
	model: model
});

/**
 * A collection of codecs which deal with string case conversions
 */
const leadingUnderscores = {
    decode: input => input.match(/^_*/)[0].length,
    encode: input => new Array(input + 1).join('_')
};
const leadingDashes = {
    decode: input => input.match(/^-*/)[0].length,
    encode: input => new Array(input + 1).join('-')
};
function identifierCodec(src, dest) {
    return compose(invert(src), dest);
}
/**
 * - PrivacyLevel is indicated by a lower undercore prefix
 * - Words are strictly lower case, except for upper case words
 * - Words are joined by a single underscore letter.
 *
 * - A word is capitalized if at least one letter is capitalized.
 *
 * eg:
 *   __the_little_BROWN_fox:   privacy 2, words: ['the', 'little', 'BROWN', 'fox']
 *   __the_little_Brown_fox:   privacy 2, words: ['the', 'little', 'BROWN', fox']
 *   the_little_fox: privacy 0, words: ['the', 'little', 'fox']
 */
const underscoreCase = {
    decode(input) {
        let privacy = leadingUnderscores.decode(input);
        input = input.substr(privacy);
        let words = immutable.List(input.split(/_/)).filter(word => word.length > 0).map(word => /[A-Z]/.test(word) ? word.toUpperCase() : word).toList();
        return { privacy, words };
    },
    encode(identifier) {
        return leadingUnderscores.encode(identifier.privacy) + identifier.words.join('_');
    }
};
/**
 * Words similarly to UnderscoreCase except with dashes
 */
const snakeCase = {
    decode(input) {
        let privacy = leadingDashes.decode(input);
        input = input.substr(privacy);
        let words = immutable.List(input.split(/[-]/)).filter(word => word.length > 0).map(word => /[A-Z]/.test(word) ? word.toUpperCase() : word).toList();
        return { privacy, words };
    },
    encode(identifier) {
        return leadingDashes.encode(identifier.privacy) + identifier.words.join('-');
    }
};
function parseCamelCaseWords(input) {
    let words = immutable.List(input.split(/(?=[A-Z])/));
    let remainingWords = words;
    return words.flatMap(word => {
        // The above regex will match SimpleHTTPRequest as ['Simple', 'H', 'T', 'T', 'P', 'Request']
        // This merges contiguous groups of single letter words and lower cases the multi-letter words,
        // yielding ['simple', 'HTTP', 'request']
        if (word.length <= 1) return [];
        let currWords = [];
        let preceedingCapitals = remainingWords.takeWhile(word => word.length === 1);
        if (!preceedingCapitals.isEmpty()) {
            remainingWords = remainingWords.skip(preceedingCapitals.count());
            currWords.push(preceedingCapitals.join(''));
        }
        remainingWords = remainingWords.skip(1);
        currWords.push(word.toLowerCase());
        return currWords;
    });
}
/**
 * The `UpperCamelCase` identifier format
 * - Privacy level is indicated by optional leading underscores
 *   e.g. __HelloWorld has privacy 2
 * - Words are separated by the following capital letter and lowercased,
 *   _unless_ a consecutive group of capital letters is encountered, in which case
 *   they are emitted as the capital word.
 *   e.g. SimpleHTTPResponse would be words ['simple', 'HTTP', 'response']
 */
const upperCamelCase = {
    decode(input) {
        let privacy = leadingUnderscores.decode(input);
        input = input.substr(privacy);
        let words = parseCamelCaseWords(input);
        return { privacy, words };
    },
    encode(input) {
        let camelWords = input.words.map(word => word[0].toUpperCase() + word.substr(1));
        console.log('identifier', input);
        let leading = leadingUnderscores.encode(input.privacy);
        console.log('leading underscores', leading);
        return leadingUnderscores.encode(input.privacy) + camelWords.join('');
    }
};
/**
 * Same as UpperCamelCase, except that the first letter of the identifier
 * is always lower case.
 */
const lowerCamelCase = {
    decode(input) {
        let privacy = leadingUnderscores.decode(input);
        input = input.substr(privacy);
        let words = parseCamelCaseWords(input);
        return { privacy, words };
    },
    encode(input) {
        let camelWords = input.words.map((word, index) => {
            if (index === 0) {
                // Don't upper case the first word.
                return word;
            }
            return word[0].toUpperCase() + word.substr(1);
        });
        return leadingUnderscores.encode(input.privacy) + camelWords.join('');
    }
};

var identifier = Object.freeze({
	identifierCodec: identifierCodec,
	underscoreCase: underscoreCase,
	snakeCase: snakeCase,
	upperCamelCase: upperCamelCase,
	lowerCamelCase: lowerCamelCase
});

exports.json = index;
exports.identifier = identifier;
exports.compose = compose;
exports.array = array;
exports.list = list;
exports.map = map;
exports.error = error;
exports.nullable = nullable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
