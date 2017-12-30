export function assertNotNull(value) {
    if (value == null)
        throw new Error('Value cannot be null');
}
export const nullSafeIdentity = {
    encode: (input) => {
        assertNotNull(input);
        return input;
    },
    decode: (input) => {
        assertNotNull(input);
        return input;
    }
};
export function objectKeys(obj) {
    return Object.keys(obj);
}
