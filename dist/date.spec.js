"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_1 = require("./date");
const utils_spec_1 = require("./utils.spec");
describe('date', () => {
    describe('dateTime', () => {
        it('should be able to encode and decode blank values', () => {
            utils_spec_1.expectThrowsOnNullOrUndefined(date_1.dateTime);
        });
        it('should be able to encode/decode a date', () => {
            expect(date_1.dateTime.encode(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
            expect(date_1.dateTime.decode('1970-01-01T00:00:00Z')).toEqual(new Date(0));
        });
    });
    describe('date', () => {
        it('should be able to encode and decode blank values', () => {
            utils_spec_1.expectThrowsOnNullOrUndefined(date_1.date);
        });
        it('should be able to encode a date in the format YYYY-MM-DD', () => {
            expect(date_1.date.encode(new Date(0))).toBe('1970-01-01');
            expect(date_1.date.decode('1970-01-01')).toEqual(new Date(0));
        });
    });
});
