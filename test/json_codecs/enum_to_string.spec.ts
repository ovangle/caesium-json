import {Map} from 'immutable';
import {enumToString} from '../../src/json_codecs/enum_to_string';

const enum MyEnum {
    ValueZero,
    ValueOne,
    ValueTwo
}

const serializedEnumValues = Map<string,MyEnum>({
    VALUE_ZERO: MyEnum.ValueZero,
    VALUE_ONE: MyEnum.ValueOne,
    VALUE_TWO: MyEnum.ValueTwo
}).flip();

describe('json_codecs.enumToString', () => {
    var codec = enumToString<MyEnum>(serializedEnumValues);
    it('should be able to convert enum values to string', () => {
        expect(codec.encode(MyEnum.ValueOne)).toBe('VALUE_ONE');
        expect(codec.encode(MyEnum.ValueZero)).toBe('VALUE_ZERO');
        expect(codec.encode(MyEnum.ValueTwo)).toBe('VALUE_TWO');
    });

    it('should be able to convert strings to enum values', () => {
        expect(codec.decode('VALUE_ZERO')).toBe(MyEnum.ValueZero);
        expect(codec.decode('VALUE_ONE')).toBe(MyEnum.ValueOne);
        expect(codec.decode('VALUE_TWO')).toBe(MyEnum.ValueTwo);
    });

    it('should handle blank values', () => {
        expect(codec.encode(null)).toBeNull();
        expect(codec.decode(null)).toBeNull();
        expect(codec.encode(undefined)).toBeUndefined();
        expect(codec.decode(undefined)).toBeUndefined();
    });

    it('should throw when decoding an unrecoginsed enum value', () => {
        expect(() => codec.decode('VALUE_THREE')).toThrow();
    })
});
