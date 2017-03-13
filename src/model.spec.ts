import {List, Record} from 'immutable';
import {EncodingException} from 'caesium-core/codec';
import {num, str} from './primitives';
import {list} from './list';
import {model} from './model';
import {
    expectThrowsOnNullOrUndefined,
    stringReversingCodec
} from './utils.spec';


const MyModelRecord = Record({
    stringProperty: '',
    numListProperty: List(),
});

class MyModel extends MyModelRecord {
    stringProperty: string;
    numListProperty: List<number>;
}


describe('model', () => {
    it('should throw on null or undefined', () => {
        expectThrowsOnNullOrUndefined(model(MyModel, {stringProperty: str}));
    });

    it('should encode/decode a model with no optional properties', () => {
        const codec = model(MyModel, {
            stringProperty: stringReversingCodec,
            numListProperty: list(num)
        })

        const value = new MyModel({
            stringProperty: 'hello world',
            numListProperty: List.of(1,2,3,4,5)
        });
        const encodedValue = {
            stringProperty: 'dlrow olleh',
            numListProperty: [1,2,3,4,5]
        };

        expect(codec.encode(value)).toEqual(encodedValue);
        expect(codec.decode(encodedValue)).toEqual(value);
    });

    it('should not encode an undeclared property', () => {
        const codec = model(MyModel, {
            numListProperty: list(num)
        });

        let value = new MyModel({
            stringProperty: 'goodbye',
            numListProperty: List.of(4, 5, 6)
        });

        expect(codec.encode(value))
            .toEqual({numListProperty: [4, 5, 6]});
    });

    it('should throw if encoded object has a property not declared on the model', () => {
        const codec = model(MyModel, {
            stringProperty: str,
            numListProperty: list(num),
        });

        const encodedValue = {
            stringProperty: 'goodbye',
            numListProperty: [1,2,3],
            missingProperty: 'missing'
        }

        expect(() => codec.decode(encodedValue))
            .toThrow(new EncodingException('\'missingProperty\' not found on \'MyModel\' codec'));
    })

    it('should throw if a required property value is missing', () => {
        const codec = model(MyModel, {
            stringProperty: stringReversingCodec,
        })

        expect(() => codec.decode({}))
            .toThrow(new EncodingException(`Required property 'stringProperty' of 'MyModel' codec not present on object`));

        const codecMissingProperty = model(MyModel, {
            missingProperty: str
        });

        const value = new MyModel();

        expect(() => codecMissingProperty.encode(value))
            .toThrow(new EncodingException(`Required property 'missingProperty' of 'MyModel' codec not present on model`));
    });

    it('should ignore optional properties if there is no value on the object', () => {
        const codec = model(MyModel, {
            optionalProperty: [str, {required: false}],
        });

        expect(codec.encode(new MyModel())).toEqual({});
        expect(codec.decode({})).toEqual(new MyModel());
    });

    it('should apply the property key converter to the keys of the object', () => {
        const codec = model(MyModel, {
            stringProperty: stringReversingCodec,
            numListProperty: list(num)
        }, stringReversingCodec);

        const value = new MyModel({
            stringProperty: 'hello world',
            numListProperty: List.of(1,2,3,4,5)
        });
        const encodedValue = {
            ytreporPgnirts: 'dlrow olleh',
            ytreporPtsiLmun: [1,2,3,4,5]
        };

        expect(codec.encode(value)).toEqual(encodedValue);

        expect(codec.decode(encodedValue)).toEqual(jasmine.any(MyModel));
        expect(codec.decode(encodedValue).toObject()).toEqual({
            stringProperty: 'hello world',
            numListProperty: List.of(1,2,3,4,5)
        });
    });
});
