import { expect } from 'chai';
import { getWeekNumber, getDayNumber, checkVelocityLimit } from '../src/app';

describe('testing week and day calculation', () => {
    it('testing the week number method', () => {
        const weekNumber: number = getWeekNumber("2020-07-20T00:00:00Z");
        expect(weekNumber).to.equal(30);
    });
    it('testing the days number method', () => {
        const dayNumber: number = getDayNumber("2020-07-20T00:00:00Z");
        expect(dayNumber).to.equal(1);
    });
});

describe('testing velocity limit', () => {
    it('single transaction lesser than 5000 should be accepted', () => {
        const isAccepted = checkVelocityLimit({"id":"10000","customer_id":"100","load_amount":"$3000","time":"2000-01-01T00:00:00Z"});
        expect(isAccepted).to.be.true;
    });

    it('sum of amount loaded in a single day lesser than 5000 should be accepted ', () => {
        checkVelocityLimit({"id":"10001","customer_id":"101","load_amount":"$2000.00","time":"2000-01-01T00:00:00Z"});
        checkVelocityLimit({"id":"10002","customer_id":"101","load_amount":"$2000.00","time":"2000-01-01T00:00:00Z"})
        const isAccepted = checkVelocityLimit({"id":"10003","customer_id":"101","load_amount":"$500.00","time":"2000-01-01T00:00:00Z"})
        expect(isAccepted).to.be.true;
    });

    it('sum of amount loaded in a week lesser than 20000 should be accepted', () => {
        checkVelocityLimit({"id":"10010","customer_id":"110","load_amount":"$4000.00","time":"2020-07-20T00:00:00Z"});
        checkVelocityLimit({"id":"10011","customer_id":"110","load_amount":"$4000.00","time":"2020-07-21T00:00:00Z"})
        const isAccepted = checkVelocityLimit({"id":"10012","customer_id":"110","load_amount":"$5000.00","time":"2020-07-23T00:00:00Z"})
        expect(isAccepted).to.be.true;
    });

    it('loading an amount greater than 5000 should NOT be accepted', () => {
        const isAccepted = checkVelocityLimit({"id":"10020","customer_id":"120","load_amount":"$6000","time":"2000-01-01T00:00:00Z"});
        expect(isAccepted).to.be.false;
    });

    it('sum of amount loaded in a single day exceeds 5000 should NOT be accepted', () => {
        checkVelocityLimit({"id":"10030","customer_id":"130","load_amount":"$2000.00","time":"2000-01-01T00:00:00Z"});
        checkVelocityLimit({"id":"10031","customer_id":"130","load_amount":"$2000.00","time":"2000-01-01T00:00:00Z"})
        const isAccepted = checkVelocityLimit({"id":"10032","customer_id":"130","load_amount":"$2000.00","time":"2000-01-01T00:00:00Z"})
        expect(isAccepted).to.be.false;
    });

    it('loading more than 3 times a day should fail', () => {
        checkVelocityLimit({"id":"10070","customer_id":"170","load_amount":"$1000.00","time":"2000-01-01T00:00:00Z"});
        checkVelocityLimit({"id":"10071","customer_id":"170","load_amount":"$1000.00","time":"2000-01-01T00:00:00Z"})
        checkVelocityLimit({"id":"10072","customer_id":"170","load_amount":"$1000.00","time":"2000-01-01T00:00:00Z"})
        const isAccepted = checkVelocityLimit({"id":"10073","customer_id":"170","load_amount":"$500.00","time":"2000-01-01T00:00:00Z"})
        expect(isAccepted).to.be.false;
    });

    it('sum of amount loaded in a week is exceeds 20000 should NOT be accepted', () => {
        checkVelocityLimit({"id":"10040","customer_id":"140","load_amount":"$5000.00","time":"2020-07-20T00:00:00Z"});
        checkVelocityLimit({"id":"10041","customer_id":"140","load_amount":"$5000.00","time":"2020-07-21T00:00:00Z"})
        checkVelocityLimit({"id":"10042","customer_id":"140","load_amount":"$5000.00","time":"2020-07-22T00:00:00Z"})
        const isAccepted = checkVelocityLimit({"id":"10043","customer_id":"140","load_amount":"$5000.00","time":"2020-07-23T00:00:00Z"})
        expect(isAccepted).to.be.true;
    });

    it('Monday is the starting day of the week.', () => {
        checkVelocityLimit({"id":"10050","customer_id":"150","load_amount":"$5000.00","time":"2020-07-19T00:00:00Z"});
        checkVelocityLimit({"id":"10051","customer_id":"150","load_amount":"$5000.00","time":"2020-07-20T00:00:00Z"});
        checkVelocityLimit({"id":"10052","customer_id":"150","load_amount":"$5000.00","time":"2020-07-21T00:00:00Z"})
        checkVelocityLimit({"id":"10053","customer_id":"150","load_amount":"$5000.00","time":"2020-07-22T00:00:00Z"})
        const isAccepted = checkVelocityLimit({"id":"10054","customer_id":"150","load_amount":"$5000.00","time":"2020-07-23T00:00:00Z"})
        expect(isAccepted).to.be.true;
    });

    it('Ignore upcoming transaction with same load id for a particular customer', () => {
        checkVelocityLimit({"id":"10060","customer_id":"160","load_amount":"$1000.00","time":"2020-07-19T00:00:00Z"});
        const isAccepted = checkVelocityLimit({"id":"10060","customer_id":"160","load_amount":"$1000.00","time":"2020-07-20T00:00:00Z"});
        expect(isAccepted).to.equal(null);
    });
});

