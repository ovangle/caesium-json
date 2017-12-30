import { assertNotNull, nullSafeIdentity } from "./utils";
export const bool = nullSafeIdentity;
export const num = nullSafeIdentity;
export const str = nullSafeIdentity;
export const date = {
    encode: (date) => {
        assertNotNull(date);
        return date.toISOString();
    },
    decode: (value) => {
        assertNotNull(value);
        let d = new Date(value);
        if (Number.isNaN(d.valueOf())) {
            throw new Error(`Not a valid date: '${value}'`);
        }
        return d;
    }
};
