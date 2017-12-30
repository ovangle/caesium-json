import {nullable} from "./nullable";

describe('nullable', () => {
  it('should convert a codec which does not accept \'null\' values into one which does', () => {
    let nullSafeIdentity = {
      encode: (value: any) => {
        if (value === null)
          throw 'Value cannot be null';
        return value;
      },
      decode: (value: any) => {
        if (value === null)
          throw 'Value cannot be null';
        return value;
      }
    };
    expect(() => nullSafeIdentity.encode(null)).toThrow();
    expect(() => nullSafeIdentity.decode(null)).toThrow();

    let codec = nullable(nullSafeIdentity);
    expect(codec.encode(null)).toBe(null);
    expect(codec.decode(null)).toBe(null);
  });
});
