import { expect } from 'chai';
import { getWeekNumber, getDayNumber } from '../src/app';

describe('testing velocity limits', () => {
    it('testing the week number method', () => {
        const weekNumber: number = getWeekNumber("2020-07-20T00:00:00Z");
        expect(weekNumber).to.equal(30);
    });
    it('testing the week number method', () => {
        const dayNumber: number = getDayNumber("2020-07-20T00:00:00Z");
        expect(dayNumber).to.equal(1);
    });
});