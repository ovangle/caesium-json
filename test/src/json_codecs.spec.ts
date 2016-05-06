import {basicTests} from './json_codecs/basic.spec';
import {modelPropertyToJsonTests} from './json_codecs/model_property_to_json.spec';
import {modelToJsonTests} from './json_codecs/model_to_json.spec';
import {modelUnionToJsonTests} from './json_codecs/model_union_to_json.spec';
import {stringCaseConverterTests} from './json_codecs/string_case_converters.spec';
import {objectToJsonTests} from "./json_codecs/object_to_json.spec";

export function jsonCodecsTests() {
    describe('json_codecs', () => {
        basicTests();
        objectToJsonTests();
        modelPropertyToJsonTests();
        modelToJsonTests();
        modelUnionToJsonTests();
        stringCaseConverterTests();
    });
}
