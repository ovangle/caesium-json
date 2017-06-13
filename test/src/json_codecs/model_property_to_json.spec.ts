import {Codec} from 'caesium-core/codec';

import {ModelMetadata} from '../../../src/model/metadata';
import {Model, Property, ModelBase} from '../../../src/model';
import {num} from '../../../src/json_codecs/basic';
import {PropertyCodec} from '../../../src/json_codecs/model_property_to_json';

const stringReversingCodec: Codec<string,string> = {
    encode: (input: string) => input.split('').reverse().join(''),
    decode: (input: string) => input.split('').reverse().join('')
};

@Model({kind: 'test::PropertyRestrictions'})
class PropertyRestrictions extends ModelBase {
    @Property({codec: stringReversingCodec})
    customCodecProperty: string;

    @Property({codec: num, readOnly: true})
    readOnlyProperty:number;

    @Property({codec: num, writeOnly: true})
    writeOnlyProperty:number;

    @Property({codec: num, required: true, allowNull: true})
    requiredProperty:number;

    @Property({codec: num, allowNull: false, required: false})
    notNullableProperty:number;
}

export function modelPropertyToJsonTests() {
    describe('model_property_to_json', () => {
        codecTests();
    });
}

function codecTests() {
    describe('PropertyCodec', () => {
        var metadata = ModelMetadata.forType(PropertyRestrictions);

        it('should use the property codec when encoding and decoding', () => {
            var codec = new PropertyCodec(metadata.properties.get('customCodecProperty'));
            expect(codec.encode('hello world')).toBe('dlrow olleh');
            expect(codec.decode('hello world')).toBe('dlrow olleh');
        });

        it('should error on decode when the property is writeOnly', () => {
            var codec = new PropertyCodec(metadata.properties.get('writeOnlyProperty'));
            expect(() => codec.decode(42)).toThrow();
            expect(codec.encode(42)).toBe(42);
        });

        it('should return `undefined` on encode when the property is readOnly', () => {
            var codec = new PropertyCodec(metadata.properties.get('readOnlyProperty'))
            expect(codec.encode(42)).toBeUndefined();
            expect(codec.decode(42)).toBe(42);
        });

        it('should error on encode when the value is required and undefined', () => {
            var codec = new PropertyCodec(metadata.properties.get('requiredProperty'));
            expect(() => codec.encode(undefined)).toThrow();
            expect(codec.encode(42)).toBe(42, 'should encode normal values');
            expect(codec.encode(null)).toBeNull('should encode null');

            expect(codec.decode(undefined)).toBeUndefined('should not error on decode');
        });

        it('should error on encode when the property is not nullable', () => {
            var codec = new PropertyCodec(metadata.properties.get('notNullableProperty'));
            expect(() => codec.encode(null)).toThrow();
            expect(codec.encode(42)).toBe(42, 'should encode normal values');
            expect(codec.encode(undefined)).toBeUndefined('should encode undefined');

            expect(codec.decode(null)).toBeNull('should not error on decode');
        });
    });
}

