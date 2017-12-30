import { List, Record } from 'immutable';
import { num, str } from './json';
import { list, object, record } from './collections';
import { expectThrowsOnNullOrUndefined, stringReversingCodec } from './test-utils';
const MyModelRecord = Record({
    stringProperty: '',
    numListProperty: List(),
});
class MyModel extends MyModelRecord {
}
describe('array', () => {
});
describe('list', () => {
});
describe('map', () => {
});
describe('set', () => {
});
describe('object', () => {
    it('should throw on null or undefined', () => {
        expectThrowsOnNullOrUndefined(object({
            stringProperty: str,
            numListProperty: list(num)
        }));
    });
    it('should encode/decode a model with no optional properties', () => {
        const codec = object({
            stringProperty: stringReversingCodec,
            numListProperty: list(num)
        });
        const value = {
            stringProperty: 'hello world',
            numListProperty: List.of(1, 2, 3, 4, 5)
        };
        codec.encode(value);
        const encodedValue = {
            stringProperty: 'dlrow olleh',
            numListProperty: [1, 2, 3, 4, 5]
        };
        expect(codec.encode(value)).toEqual(encodedValue);
        expect(codec.decode(encodedValue)).toEqual(value);
    });
    it('should throw if encoded object has a property not declared on the model', () => {
        const codec = object({
            stringProperty: str,
            numListProperty: list(num),
        });
        const encodedValue = {
            stringProperty: 'goodbye',
            numListProperty: [1, 2, 3],
            missingProperty: 'missing'
        };
        expect(() => codec.decode(encodedValue))
            .toThrow('No codec provided for \'missingProperty\'');
    });
    it('should throw when encoding an object with a prototype which isn\'t Object.prototype', () => {
        let codec = object({});
        let complexPrototype = Object.create({});
        expect(() => codec.encode(complexPrototype)).toThrow('Can only encode objects with the prototype \'Object.prototype\'');
        let nullPrototype = Object.create(null);
        expect(() => codec.encode(nullPrototype)).toThrow('Can only encode objects with the prototype \'Object.prototype\'');
    });
});
describe('record', () => {
    it('should throw on null or undefined', () => {
        expectThrowsOnNullOrUndefined(record(MyModel, {
            stringProperty: str,
            numListProperty: list(num)
        }));
    });
    it('should encode/decode a model with no optional properties', () => {
        const codec = record(MyModel, {
            stringProperty: stringReversingCodec,
            numListProperty: list(num)
        });
        const value = new MyModel({
            stringProperty: 'hello world',
            numListProperty: List.of(1, 2, 3, 4, 5)
        });
        codec.encode(value);
        const encodedValue = {
            stringProperty: 'dlrow olleh',
            numListProperty: [1, 2, 3, 4, 5]
        };
        expect(codec.encode(value)).toEqual(encodedValue);
        expect(codec.decode(encodedValue)).toEqual(value);
    });
    it('should throw if encoded object has a property not declared on the model', () => {
        const codec = record(MyModel, {
            stringProperty: str,
            numListProperty: list(num),
        });
        const encodedValue = {
            stringProperty: 'goodbye',
            numListProperty: [1, 2, 3],
            missingProperty: 'missing'
        };
        expect(() => codec.decode(encodedValue))
            .toThrow('No codec provided for \'missingProperty\'');
    });
});
