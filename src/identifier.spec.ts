import {List} from 'immutable';
import {Codec} from "./codec";
import {
  identifierCodec, underscoreCase, lowerCamelCase, snakeCase, upperCamelCase, Identifier
} from './identifier';

function immutableEqual(obj_a: any, obj_b: any) {
  if (List.isList(obj_a) && List.isList(obj_b)) {
    return (obj_a as List<any>).equals(obj_b);
  }
}

describe('object-identifiers', () => {
  beforeEach(() => {
    jasmine.addCustomEqualityTester(immutableEqual)
  });

  function testDecodePrivacy(codec: Codec<Identifier, string>, ...inputs: Array<string>) {
    let privacies = inputs.map((input) => codec.decode(input).privacy);

    expect(privacies[0]).toEqual(0, 'should be privacy level 0')
    expect(privacies[1]).toEqual(1, 'should be privacy level 1')
    expect(privacies[2]).toEqual(2, 'should be privacy level 2')
    expect(privacies[3]).toEqual(3, 'should be privacy level 3')
  }

  function testDecodeEmptyString(codec: Codec<Identifier, string>) {
    expect(codec.decode('').words).toEqual(List());
  }

  function testEncodeIdentifier(codec: Codec<Identifier, string>, publicHelloWorld: string, privateHelloWorld: string, publicWithCapital: string ) {
    expect(codec.encode({privacy: 0, words: List.of('public', 'hello', 'world')})).toEqual(publicHelloWorld);
    expect(codec.encode({privacy: 1, words: List.of('private', 'hello', 'world')})).toEqual(privateHelloWorld);
    expect(codec.encode({privacy: 0, words: List.of('public', 'WITH', 'capital')})).toEqual(publicWithCapital);
  }

  describe('underscoreCase', () => {
    it('should decode the privacy of an underscore_case identifer', () => {
      testDecodePrivacy(underscoreCase, 'public', '_priv_one', '__priv_two', '___priv_three');
    });

    it('should decode an empty string', () => {
      testDecodeEmptyString(underscoreCase);
    });

    it('should uppercase any words with at least one capital', () => {
      expect(underscoreCase.decode('hello_woRld').words).toEqual(List.of('hello', 'WORLD'));
      expect(underscoreCase.decode('HELLO_world').words).toEqual(List.of('HELLO', 'world'));
    });

    it('should encode an identifier', () => {
      testEncodeIdentifier(underscoreCase,
        'public_hello_world',
        '_private_hello_world',
        'public_WITH_capital');
    });
  });

  describe('snakeCase', () => {
    it('should decode the privacy of a snake-case identifier', () => {
      testDecodePrivacy(snakeCase, 'public', '-priv-one', '--priv-two', '---priv-three');
    });

    it('should decode an empty string', () => {
      testDecodeEmptyString(snakeCase);
    });

    it('should uppercase any words with at least one capital', () => {
      expect(snakeCase.decode('hello-woRld').words).toEqual(List.of('hello', 'WORLD'));
      expect(snakeCase.decode('HELLO-world').words).toEqual(List.of('HELLO', 'world'));
    });

    it('should encode an identifier', () => {
      testEncodeIdentifier(snakeCase,
        'public-hello-world',
        '-private-hello-world',
        'public-WITH-capital');
    });
  });

  describe('lowerCamelCase', () => {
    it('should decode the privacy of a lowerCamelCase identifier', () => {
      testDecodePrivacy(lowerCamelCase, 'public', '_privOne', '__privTwo', '___privThree');
    })

    it('should decode an empty string', () => {
      testDecodeEmptyString(lowerCamelCase);
    });

    it('should group of capital letters and lowercase everything else', () => {
      expect(lowerCamelCase.decode('simpleHTTPRequest').words)
        .toEqual(List.of('simple', 'HTTP', 'request'));
    });

    it('should encode an identifier', () => {
      testEncodeIdentifier(lowerCamelCase,
        'publicHelloWorld',
        '_privateHelloWorld',
        'publicWITHCapital');
    });
  });

  describe('upperCamelCase', () => {
    it('should decode the privacy of an UpperCamelCase identifier', () => {
      testDecodePrivacy(upperCamelCase, 'Public', '_PrivOne', '__PrivTwo', '___PrivThree');
    })

    it('should decode an empty string', () => {
      testDecodeEmptyString(upperCamelCase);
    });

    it('should group capital leters and lowercase everything else', () => {
      expect(lowerCamelCase.decode('SimpleHTTPRequest').words).toEqual(List.of('simple', 'HTTP', 'request'));
    })

    it('should encode an identifier', () => {
      testEncodeIdentifier(upperCamelCase,
        'PublicHelloWorld',
        '_PrivateHelloWorld',
        'PublicWITHCapital');
    })
  });

  it('should be possible to encode between formats', () => {
    function test(reason: string, codec: Codec<string,string>, input: string, output: string) {
      expect(codec.encode(input)).toEqual(output, `${reason} (encode)`);
      expect(codec.decode(output)).toEqual(input, `${reason} (decode)`);
    }

    test('underscore_case -> underscore_case',  identifierCodec(underscoreCase, underscoreCase), '__sample_underscore_STRING_value', '__sample_underscore_STRING_value');
    test('underscore_case -> snake-case',       identifierCodec(underscoreCase, snakeCase),      '__sample_underscore_STRING_value', '--sample-underscore-STRING-value');
    test('underscore_case -> lowerCamelCase',   identifierCodec(underscoreCase,lowerCamelCase),  '__sample_underscore_STRING_value', '__sampleUnderscoreSTRINGValue');
    test('underscore_case -> UpperCamelCase',   identifierCodec(underscoreCase, upperCamelCase), '__sample_underscore_STRING_value', '__SampleUnderscoreSTRINGValue');

    test('snake-case -> underscore_case',       identifierCodec(snakeCase, underscoreCase),       '--sample-snake-STRING-value', '__sample_snake_STRING_value');
    test('snake-case -> snake-case',            identifierCodec(snakeCase, snakeCase),            '--sample-snake-STRING-value', '--sample-snake-STRING-value');
    test('snake-case -> lowerCamelCase',        identifierCodec(snakeCase, lowerCamelCase),       '--sample-snake-STRING-value', '__sampleSnakeSTRINGValue');
    test('snake-case -> UpperCamelCase',        identifierCodec(snakeCase, upperCamelCase),       '--sample-snake-STRING-value', '__SampleSnakeSTRINGValue');

    test('lowerCamelCase -> underscoreCase',    identifierCodec(lowerCamelCase, underscoreCase),  '__sampleLowerCamelSTRINGValue', '__sample_lower_camel_STRING_value');
    test('lowerCamelCase -> snake-case',        identifierCodec(lowerCamelCase, snakeCase),       '__sampleLowerCamelSTRINGValue', '--sample-lower-camel-STRING-value');
    test('lowerCamelCase -> lowerCamelCase',    identifierCodec(lowerCamelCase, lowerCamelCase),  '__sampleLowerCamelSTRINGValue', '__sampleLowerCamelSTRINGValue');
    test('lowerCamelCase -> UpperCamelCase',    identifierCodec(lowerCamelCase, upperCamelCase),  '__sampleLowerCamelSTRINGValue', '__SampleLowerCamelSTRINGValue');

    test('UpperCamelCase -> underscore_case',   identifierCodec(upperCamelCase, underscoreCase),  '__SampleUpperCamelSTRINGValue', '__sample_upper_camel_STRING_value');
    test('UpperCamelCase -> snake-case',        identifierCodec(upperCamelCase, snakeCase),       '__SampleUpperCamelSTRINGValue', '--sample-upper-camel-STRING-value');
    test('UpperCamelCase -> lowerCamelCase',    identifierCodec(upperCamelCase, lowerCamelCase),  '__SampleUpperCamelSTRINGValue', '__sampleUpperCamelSTRINGValue');
    test('UpperCamelCase -> UpperCamelCase',    identifierCodec(upperCamelCase, upperCamelCase),  '__SampleUpperCamelSTRINGValue', '__SampleUpperCamelSTRINGValue');

  });

});


