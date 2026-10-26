import type { EMISchedule } from '../types/bank.ts';

/**
 * Pure financial calculations and business rules according to UML specifications.
 */

export function calculateLoanEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) return Math.round((principal / tenureMonths) * 100) / 100;
  
  const monthlyRate = annualRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi * 100) / 100;
}

export function calculateSavingsInterest(balance: number, annualRate: number, days: number = 30): number {
  if (balance <= 0 || annualRate <= 0) return 0;
  const interest = (balance * annualRate * (days / 365)) / 100;
  return Math.round(interest * 100) / 100;
}

export function checkOverdraftLimit(
  currentBalance: number,
  overdraftLimit: number,
  withdrawAmount: number
): { allowed: boolean; availableBalance: number; reason?: string } {
  const effectiveAvailable = currentBalance + overdraftLimit;
  if (withdrawAmount <= 0) {
    return { allowed: false, availableBalance: effectiveAvailable, reason: 'Amount must be greater than zero' };
  }
  if (withdrawAmount > effectiveAvailable) {
    return {
      allowed: false,
      availableBalance: effectiveAvailable,
      reason: `Insufficient Balance! Current balance: ₹${currentBalance}, Overdraft limit: ₹${overdraftLimit}. Total available: ₹${effectiveAvailable}`,
    };
  }
  return { allowed: true, availableBalance: effectiveAvailable };
}

export function evaluateCreditEligibility(
  creditScore: number,
  monthlyIncome: number,
  requestedAmount: number,
  loanType: string
): { eligible: boolean; maxAllowedAmount: number; suggestedInterestRate: number; remarks: string } {
  // Typical credit bureau criteria
  if (creditScore < 600) {
    return {
      eligible: false,
      maxAllowedAmount: 0,
      suggestedInterestRate: 0,
      remarks: `Credit score of ${creditScore} is below minimum threshold (600). Application rejected by Credit Bureau.`,
    };
  }

  // Base interest rates based on loan type and credit score
  let baseRate = 8.5;
  if (loanType === 'Home Loan') baseRate = 8.25;
  else if (loanType === 'Car Loan') baseRate = 9.0;
  else if (loanType === 'Personal Loan') baseRate = 11.5;
  else if (loanType === 'Education Loan') baseRate = 7.9;
  else if (loanType === 'Business Loan') baseRate = 10.5;

  // Credit score risk discount
  if (creditScore >= 780) {
    baseRate -= 0.5;
  } else if (creditScore < 680) {
    baseRate += 1.0;
  }

  // Max eligibility multiplier
  const incomeMultiplier = creditScore >= 750 ? 40 : 25;
  const maxAllowedAmount = Math.max(100000, monthlyIncome * incomeMultiplier);

  const eligible = requestedAmount <= maxAllowedAmount;
  const remarks = eligible
    ? `Eligible for ₹${requestedAmount.toLocaleString()} at ${baseRate.toFixed(2)}% p.a.`
    : `Requested ₹${requestedAmount.toLocaleString()} exceeds eligible limit of ₹${maxAllowedAmount.toLocaleString()} based on income & credit score.`;

  return {
    eligible,
    maxAllowedAmount,
    suggestedInterestRate: Math.round(baseRate * 100) / 100,
    remarks,
  };
}

export function generateEMIScheduleList(
  loanId: number,
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDateStr: string = new Date().toISOString()
): EMISchedule[] {
  const monthlyRate = annualRate / (12 * 100);
  const emi = calculateLoanEMI(principal, annualRate, tenureMonths);
  let remainingPrincipal = principal;
  const schedule: EMISchedule[] = [];
  const startDate = new Date(startDateStr);

  for (let i = 1; i <= tenureMonths; i++) {
    const interestPart = Math.round(remainingPrincipal * monthlyRate * 100) / 100;
    const principalPart = i === tenureMonths ? remainingPrincipal : Math.round((emi - interestPart) * 100) / 100;
    remainingPrincipal = Math.max(0, Math.round((remainingPrincipal - principalPart) * 100) / 100);

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      emiId: Number(`${loanId}${i.toString().padStart(2, '0')}`),
      loanId,
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      emiAmount: emi,
      principalAmount: principalPart,
      interestAmount: interestPart,
      paidAmount: 0,
      status: 'Pending',
    });
  }

  return schedule;
}
