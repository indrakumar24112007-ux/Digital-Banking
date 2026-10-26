import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLoanEMI,
  calculateSavingsInterest,
  checkOverdraftLimit,
  evaluateCreditEligibility,
  generateEMIScheduleList,
} from './financialRules.ts';

test('calculateLoanEMI calculates correct monthly payment for standard home loan', () => {
  // Principal: 250,000, 8.5% annual rate, 36 months
  const emi = calculateLoanEMI(250000, 8.5, 36);
  assert.equal(emi, 7891.88);
});

test('calculateSavingsInterest correctly computes interest for 30 days', () => {
  const interest = calculateSavingsInterest(100000, 4.0, 30);
  // (100000 * 4 * 30) / (365 * 100) = ~328.77
  assert.equal(interest, 328.77);
});

test('checkOverdraftLimit allows withdrawal within current balance plus overdraft', () => {
  const balance = 10000;
  const overdraftLimit = 50000; // total 60000
  
  // Can withdraw 40000
  const check1 = checkOverdraftLimit(balance, overdraftLimit, 40000);
  assert.equal(check1.allowed, true);

  // Cannot withdraw 70000
  const check2 = checkOverdraftLimit(balance, overdraftLimit, 70000);
  assert.equal(check2.allowed, false);
});

test('evaluateCreditEligibility rejects credit score under 600', () => {
  const result = evaluateCreditEligibility(550, 50000, 100000, 'Personal Loan');
  assert.equal(result.eligible, false);
  assert.match(result.remarks, /below minimum threshold/i);
});

test('evaluateCreditEligibility approves credit score above 750 within limit', () => {
  const result = evaluateCreditEligibility(780, 80000, 1000000, 'Home Loan');
  assert.equal(result.eligible, true);
  assert.ok(result.suggestedInterestRate <= 8.25);
});

test('generateEMIScheduleList creates proper number of installments', () => {
  const schedule = generateEMIScheduleList(7001, 120000, 10, 12);
  assert.equal(schedule.length, 12);
  assert.equal(schedule[0].installmentNumber, 1);
  assert.equal(schedule[11].installmentNumber, 12);
  assert.equal(schedule[0].status, 'Pending');
});
