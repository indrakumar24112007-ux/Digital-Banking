export type UserRole = 'Customer' | 'Bank Employee' | 'Bank Officer' | 'Administrator';

export type AccountType = 'Savings' | 'Current' | 'Fixed';
export type CustomerType = 'Individual' | 'Corporate' | 'Joint';
export type CustomerStatus = 'Active' | 'KYC Verification Pending' | 'Rejected' | 'Inactive';
export type AccountStatus = 'Active' | 'Closed' | 'Pending';
export type TransactionType = 'Deposit' | 'Withdraw' | 'Transfer' | 'Payment';
export type TransactionStatus = 'Success' | 'Failed' | 'Pending';
export type PaymentType = 'Bill Payment' | 'Recharge Mobile' | 'Credit Card Payment' | 'Loan EMI Payment';
export type PaymentMode = 'UPI' | 'Card' | 'Net Banking';
export type LoanType = 'Home Loan' | 'Personal Loan' | 'Car Loan' | 'Education Loan' | 'Business Loan';
export type LoanStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'CLOSED' | 'Active';
export type EMIStatus = 'Pending' | 'Paid' | 'Overdue';

export interface Bank {
  bankId: number;
  bankName: string;
  address?: string;
  phone?: string;
}

export interface Address {
  addressId: number;
  street: string;
  city: string;
  state: string;
}

export interface Contact {
  contactId: number;
  contactType: 'Email' | 'Phone';
  value: string;
}

export interface CustomerProfile {
  profileId: number;
  occupation: string;
  incomeRange: string;
}

export interface CustomerDocument {
  documentId: number;
  documentType: 'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Salary Slip' | 'ITR';
  documentNumber: string;
  issuedDate: string;
  expiryDate: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface Customer {
  customerId: number;
  customerName: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  registrationDate: string;
  customerType: CustomerType;
  addresses: Address[];
  contacts: Contact[];
  profile?: CustomerProfile;
  documents: CustomerDocument[];
}

export interface User {
  userId: number;
  name: string;
  email: string;
  password?: string;
  pin: string;
  phone?: string;
  role: UserRole;
  customerId?: number;
  accountNo?: string;
  employeeId?: number;
  department?: string;
  adminId?: number;
}

export interface BaseAccount {
  accountId: number;
  accountNo: string;
  customerId: number;
  accountType: AccountType;
  balance: number;
  openDate: string;
  status: AccountStatus;
}

export interface SavingsAccount extends BaseAccount {
  accountType: 'Savings';
  interestRate: number; // e.g. 4.0 (%)
}

export interface CurrentAccount extends BaseAccount {
  accountType: 'Current';
  overdraftLimit: number; // e.g. 50000
}

export interface FixedAccount extends BaseAccount {
  accountType: 'Fixed';
  interestRate: number; // e.g. 7.5 (%)
  tenureMonths: number;
  maturityDate: string;
}

export type Account = SavingsAccount | CurrentAccount | FixedAccount;

export interface Transaction {
  transactionId: number;
  accountNo: string;
  type: TransactionType;
  amount: number;
  transDate: string;
  description: string;
  status: TransactionStatus;
  fromAccountNo?: string;
  toAccountNo?: string;
  receiptId?: number;
  referenceId?: string;
}

export interface Receipt {
  receiptId: number;
  receiptDate: string;
  amount: number;
  receiptType: 'Deposit' | 'Withdraw' | 'Fund Transfer' | 'Payment' | 'Loan EMI';
  accountNo: string;
  customerName: string;
  referenceNumber: string;
  paymentMode?: string;
  details: Record<string, string | number>;
}

export interface PaymentRecord {
  paymentId: number;
  accountNo: string;
  paymentType: PaymentType;
  paymentMode: PaymentMode;
  amount: number;
  payeeDetails: string;
  paymentDate: string;
  status: 'Success' | 'Failed';
  receiptId?: number;
}

export interface Collateral {
  collateralId: number;
  collateralType: string;
  collateralValue: number;
  documentNo: string;
}

export interface Guarantor {
  guarantorId: number;
  guarantorName: string;
  relationship: string;
  contactNumber: string;
}

export interface EMISchedule {
  emiId: number;
  loanId: number;
  installmentNumber: number;
  dueDate: string;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  paidAmount: number;
  status: EMIStatus;
  paidDate?: string;
}

export interface LoanApplication {
  applicationId: number;
  customerId: number;
  customerName: string;
  loanType: LoanType;
  requestedAmount: number;
  tenureMonths: number;
  status: LoanStatus;
  applicationDate: string;
  creditScore: number;
  rejectionReason?: string;
  linkedAccountNo: string;
  collateral?: Collateral;
  guarantor?: Guarantor;
}

export interface Loan {
  loanId: number;
  applicationId: number;
  customerId: number;
  accountNo: string;
  loanType: LoanType;
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  status: LoanStatus;
  emiAmount: number;
  remainingAmount: number;
  collateral?: Collateral;
  guarantor?: Guarantor;
}

export interface Notification {
  notificationId: number;
  customerId?: number;
  recipient: string;
  channel: 'SMS' | 'Email' | 'System';
  message: string;
  sentDate: string;
  read: boolean;
}

export interface AuditLog {
  logId: number;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE' | 'INFO';
}

export interface UMLTraceStep {
  id: string;
  timestamp: string;
  diagram: 'Sequence' | 'Activity' | 'Statechart' | 'Component' | 'Class';
  module: 'Login' | 'Customer' | 'Account' | 'Transaction' | 'Payment' | 'Loan' | 'Report';
  source: string;
  target: string;
  message: string;
  note?: string;
  status: 'executing' | 'completed' | 'failed';
}
