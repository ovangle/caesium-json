import { date, dateTime } from './date';
import { expectThrowsOnNullOrUndefined } from './utils.spec';
describe('date', () => {
    describe('dateTime', () => {
        it('should be able to encode and decode blank values', () => {
            expectThrowsOnNullOrUndefined(dateTime);
        });
        it('should be able to encode/decode a date', () => {
            expect(dateTime.encode(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
            expect(dateTime.decode('1970-01-01T00:00:00Z')).toEqual(new Date(0));
        });
    });
    describe('date', () => {
        it('should be able to encode and decode blank values', () => {
            expectThrowsOnNullOrUndefined(date);
        });
        it('should be able to encode a date in the format YYYY-MM-DD', () => {
            expect(date.encode(new Date(0))).toBe('1970-01-01');
            expect(date.decode('1970-01-01')).toEqual(new Date(0));
        });
    });
});
