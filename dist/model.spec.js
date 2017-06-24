"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const codec_1 = require("caesium-core/codec");
const primitives_1 = require("./primitives");
const list_1 = require("./list");
const model_1 = require("./model");
const utils_spec_1 = require("./utils.spec");
const MyModelRecord = immutable_1.Record({
    stringProperty: '',
    numListProperty: immutable_1.List(),
});
class MyModel extends MyModelRecord {
}
describe('model', () => {
    it('should throw on null or undefined', () => {
        utils_spec_1.expectThrowsOnNullOrUndefined(model_1.model(MyModel, { stringProperty: primitives_1.str }));
    });
    it('should encode/decode a model with no optional properties', () => {
        const codec = model_1.model(MyModel, {
            stringProperty: utils_spec_1.stringReversingCodec,
            numListProperty: list_1.list(primitives_1.num)
        });
        const value = new MyModel({
            stringProperty: 'hello world',
            numListProperty: immutable_1.List.of(1, 2, 3, 4, 5)
        });
        const encodedValue = {
            stringProperty: 'dlrow olleh',
            numListProperty: [1, 2, 3, 4, 5]
        };
        expect(codec.encode(value)).toEqual(encodedValue);
        expect(codec.decode(encodedValue)).toEqual(value);
    });
    it('should not encode an undeclared property', () => {
        const codec = model_1.model(MyModel, {
            numListProperty: list_1.list(primitives_1.num)
        });
        let value = new MyModel({
            stringProperty: 'goodbye',
            numListProperty: immutable_1.List.of(4, 5, 6)
        });
        expect(codec.encode(value))
            .toEqual({ numListProperty: [4, 5, 6] });
    });
    it('should throw if encoded object has a property not declared on the model', () => {
        const codec = model_1.model(MyModel, {
            stringProperty: primitives_1.str,
            numListProperty: list_1.list(primitives_1.num),
        });
        const encodedValue = {
            stringProperty: 'goodbye',
            numListProperty: [1, 2, 3],
            missingProperty: 'missing'
        };
        expect(() => codec.decode(encodedValue))
            .toThrow(new codec_1.EncodingException('\'missingProperty\' not found on \'MyModel\' codec'));
    });
    it('should throw if a required property value is missing', () => {
        const codec = model_1.model(MyModel, {
            stringProperty: utils_spec_1.stringReversingCodec,
        });
        expect(() => codec.decode({}))
            .toThrow(new codec_1.EncodingException(`Required property 'stringProperty' of 'MyModel' codec not present on object`));
        const codecMissingProperty = model_1.model(MyModel, {
            missingProperty: primitives_1.str
        });
        const value = new MyModel();
        expect(() => codecMissingProperty.encode(value))
            .toThrow(new codec_1.EncodingException(`Required property 'missingProperty' of 'MyModel' codec not present on model`));
    });
    it('should ignore optional properties if there is no value on the object', () => {
        const codec = model_1.model(MyModel, {
            optionalProperty: [primitives_1.str, { required: false }],
        });
        expect(codec.encode(new MyModel())).toEqual({});
        expect(codec.decode({})).toEqual(new MyModel());
    });
    it('should apply the property key converter to the keys of the object', () => {
        const codec = model_1.model(MyModel, {
            stringProperty: utils_spec_1.stringReversingCodec,
            numListProperty: list_1.list(primitives_1.num)
        }, utils_spec_1.stringReversingCodec);
        const value = new MyModel({
            stringProperty: 'hello world',
            numListProperty: immutable_1.List.of(1, 2, 3, 4, 5)
        });
        const encodedValue = {
            ytreporPgnirts: 'dlrow olleh',
            ytreporPtsiLmun: [1, 2, 3, 4, 5]
        };
        expect(codec.encode(value)).toEqual(encodedValue);
        expect(codec.decode(encodedValue)).toEqual(jasmine.any(MyModel));
        expect(codec.decode(encodedValue).toObject()).toEqual({
            stringProperty: 'hello world',
            numListProperty: immutable_1.List.of(1, 2, 3, 4, 5)
        });
    });
});
