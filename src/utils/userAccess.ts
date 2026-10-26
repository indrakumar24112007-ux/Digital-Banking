import { Account, Transaction, Loan, LoanApplication, PaymentRecord, Customer, User } from '../types/bank.ts';
import { BankState } from '../services/bankEngine.ts';

/**
 * Returns strictly the logged-in user's account(s).
 * Enforces rule: "if user logined into the application only the user account should be accessed and visible."
 */
export function getLoggedInUserAccounts(state: BankState): Account[] {
  const currentUser = state.currentUser;
  if (!currentUser) return [];

  const userAccountNo = currentUser.accountNo?.trim().toUpperCase();
  const userCustomerId = currentUser.customerId;

  return state.accounts.filter((a: Account) => {
    const accNo = a.accountNo.trim().toUpperCase();
    // 1. Direct match with the user's primary account number
    if (userAccountNo && accNo === userAccountNo) {
      return true;
    }
    // 2. Match with user's customerId, avoiding collision with other known users
    if (userCustomerId && a.customerId === userCustomerId) {
      const isOtherUserPrimary = state.users.some(
        (u: User) => u.userId !== currentUser.userId && u.accountNo?.trim().toUpperCase() === accNo
      );
      if (!isOtherUserPrimary) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Returns set of account numbers belonging strictly to the logged-in user
 */
export function getLoggedInUserAccountNos(state: BankState): Set<string> {
  const accounts = getLoggedInUserAccounts(state);
  return new Set(accounts.map((a: Account) => a.accountNo.trim().toUpperCase()));
}

/**
 * Returns transactions belonging strictly to the logged-in user's account
 */
export function getLoggedInUserTransactions(state: BankState): Transaction[] {
  const accNos = getLoggedInUserAccountNos(state);
  if (accNos.size === 0) return [];

  return state.transactions.filter(
    (t: Transaction) =>
      accNos.has(t.accountNo.trim().toUpperCase()) ||
      (t.fromAccountNo && accNos.has(t.fromAccountNo.trim().toUpperCase())) ||
      (t.toAccountNo && accNos.has(t.toAccountNo.trim().toUpperCase()))
  );
}

/**
 * Returns payments belonging strictly to the logged-in user's account
 */
export function getLoggedInUserPayments(state: BankState): PaymentRecord[] {
  const accNos = getLoggedInUserAccountNos(state);
  if (accNos.size === 0) return [];

  return state.payments.filter((p: PaymentRecord) =>
    accNos.has(p.accountNo.trim().toUpperCase())
  );
}

/**
 * Returns loans belonging strictly to the logged-in user
 */
export function getLoggedInUserLoans(state: BankState): Loan[] {
  const currentUser = state.currentUser;
  if (!currentUser) return [];
  const accNos = getLoggedInUserAccountNos(state);

  return state.loans.filter(
    (l: Loan) =>
      (currentUser.customerId && l.customerId === currentUser.customerId) ||
      (l.accountNo && accNos.has(l.accountNo.trim().toUpperCase()))
  );
}

/**
 * Returns loan applications belonging strictly to the logged-in user
 */
export function getLoggedInUserLoanApplications(state: BankState): LoanApplication[] {
  const currentUser = state.currentUser;
  if (!currentUser) return [];
  const accNos = getLoggedInUserAccountNos(state);

  return state.loanApplications.filter(
    (a: LoanApplication) =>
      (currentUser.customerId && a.customerId === currentUser.customerId) ||
      (a.linkedAccountNo && accNos.has(a.linkedAccountNo.trim().toUpperCase()))
  );
}

/**
 * Returns customer profile belonging strictly to the logged-in user
 */
export function getLoggedInUserCustomers(state: BankState): Customer[] {
  const currentUser = state.currentUser;
  if (!currentUser) return [];

  return state.customers.filter(
    (c: Customer) =>
      (currentUser.customerId && c.customerId === currentUser.customerId) ||
      (currentUser.accountNo && c.addresses && c.customerName.toLowerCase() === currentUser.name.toLowerCase()) ||
      c.email.toLowerCase() === currentUser.email.toLowerCase()
  );
}
