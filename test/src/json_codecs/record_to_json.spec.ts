import {Codec} from 'caesium-core/codec';
import {str} from "../../../src/json_codecs/basic";
import {recordCodec} from '../../../src/json_codecs/record_to_json';

class MyRecord extends Immutable.Record({camelCasePropertyName: 'hello', customCodec: 0}) {
    camelCasePropertyName: string;
    customCodec: number;
}

export function recordToJsonTests() {
    describe('record_to_json', () => {
        codecTests();
    });
}

function codecTests() {
    describe('recordCodec', () => {
        var codec = recordCodec<MyRecord>({
            camelCasePropertyName: str,
            customCodec: {
                encode: (input:number) => input + 1,
                decode: (input:number) => input - 1
            }
        }, (args: any) => new MyRecord(args));

        it('should be possible to encode a record', () => {
            var record = new MyRecord({camelCasePropertyName: 'hello world'});

            expect(codec.encode(record)).toEqual({
                camel_case_property_name: 'hello world',
                custom_codec: 1
            });
        });

        it('should be possible to decode a record', () => {
            var json = {camel_case_property_name: 'jimmy', custom_codec: 1};
            expect(codec.decode(json))
                .toEqual(new MyRecord({
                    camelCasePropertyName: 'jimmy',
                    customCodec: 0
                }))
        });
    });
}
