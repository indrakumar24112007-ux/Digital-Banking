import {
  User,
  Customer,
  Account,
  Transaction,
  Receipt,
  PaymentRecord,
  Loan,
  LoanApplication,
  EMISchedule,
  Notification,
  AuditLog,
  UMLTraceStep,
  AccountType,
  PaymentType,
  PaymentMode,
  LoanType,
} from '../types/bank.ts';
import {
  INITIAL_BANK,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_RECEIPTS,
  INITIAL_PAYMENTS,
  INITIAL_LOANS,
  INITIAL_LOAN_APPLICATIONS,
  INITIAL_EMI_SCHEDULES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData.ts';
import {
  calculateLoanEMI,
  calculateSavingsInterest,
  checkOverdraftLimit,
  evaluateCreditEligibility,
  generateEMIScheduleList,
} from '../utils/financialRules.ts';

const STORAGE_KEY = 'apex_bank_ooad_state_v2';

export interface BankState {
  currentUser: User | null;
  users: User[];
  customers: Customer[];
  accounts: Account[];
  transactions: Transaction[];
  receipts: Receipt[];
  payments: PaymentRecord[];
  loans: Loan[];
  loanApplications: LoanApplication[];
  emiSchedules: EMISchedule[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  umlTraces: UMLTraceStep[];
  currentUMLState: {
    module: string;
    stateName: string;
    substate?: string;
    historyState?: string;
  };
  pendingPasswordReset?: {
    accountNo: string;
    otp: string;
    phone: string;
    expiresAt: number;
  };
}

class BankEngine {
  private state: BankState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): BankState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure account ownership is strictly aligned to respective users
        const accounts = (parsed.accounts || INITIAL_ACCOUNTS).map((acc: any) => {
          if (acc.accountNo === 'ACC1002') return { ...acc, customerId: 201 };
          if (acc.accountNo === 'ACC1003') return { ...acc, customerId: 401 };
          if (acc.accountNo === 'ACC1004') return { ...acc, customerId: 301 };
          return acc;
        });

        // Ensure all customer profiles exist
        const customerIds = new Set((parsed.customers || []).map((c: any) => c.customerId));
        const missingCustomers = INITIAL_CUSTOMERS.filter((c) => !customerIds.has(c.customerId));
        const customers = [...(parsed.customers || []), ...missingCustomers];

        return {
          ...parsed,
          accounts,
          customers,
          currentUser: null, // Always start with Login Page on app launch / reload
        };
      }
    } catch {
      // ignore
    }

    return {
      currentUser: null, // Default null so app starts on Login Page
      users: [...INITIAL_USERS],
      customers: [...INITIAL_CUSTOMERS],
      accounts: [...INITIAL_ACCOUNTS],
      transactions: [...INITIAL_TRANSACTIONS],
      receipts: [...INITIAL_RECEIPTS],
      payments: [...INITIAL_PAYMENTS],
      loans: [...INITIAL_LOANS],
      loanApplications: [...INITIAL_LOAN_APPLICATIONS],
      emiSchedules: [...INITIAL_EMI_SCHEDULES],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      umlTraces: [
        {
          id: 'init-1',
          timestamp: new Date().toLocaleTimeString(),
          diagram: 'Component',
          module: 'Account',
          source: 'Web Server',
          target: 'Application Server',
          message: 'Initialize Core Banking Engine & OOAD Repositories',
          status: 'completed',
        },
      ],
      currentUMLState: {
        module: 'Transaction',
        stateName: 'Idle',
        substate: 'showTransactionMenu()',
      },
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // storage full or disabled
    }
    this.notify();
  }

  public resetAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      currentUser: INITIAL_USERS[0],
      users: [...INITIAL_USERS],
      customers: [...INITIAL_CUSTOMERS],
      accounts: [...INITIAL_ACCOUNTS],
      transactions: [...INITIAL_TRANSACTIONS],
      receipts: [...INITIAL_RECEIPTS],
      payments: [...INITIAL_PAYMENTS],
      loans: [...INITIAL_LOANS],
      loanApplications: [...INITIAL_LOAN_APPLICATIONS],
      emiSchedules: [...INITIAL_EMI_SCHEDULES],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      umlTraces: [
        {
          id: 'reset-1',
          timestamp: new Date().toLocaleTimeString(),
          diagram: 'Component',
          module: 'Account',
          source: 'System Admin',
          target: 'Database Server',
          message: 'State reset to initial UML baseline seed',
          status: 'completed',
        },
      ],
      currentUMLState: {
        module: 'Transaction',
        stateName: 'Idle',
        substate: 'showTransactionMenu()',
      },
    };
    this.saveState();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getState(): BankState {
    return this.state;
  }

  // --- UML TRACE RECORDER ---
  public addUMLTrace(step: Omit<UMLTraceStep, 'id' | 'timestamp'>) {
    const trace: UMLTraceStep = {
      ...step,
      id: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    this.state.umlTraces = [trace, ...this.state.umlTraces.slice(0, 99)]; // keep latest 100
    this.state.currentUMLState = {
      module: step.module,
      stateName: step.status === 'failed' ? 'System Error / Rejection' : step.message.split('(')[0] || 'Executing',
      substate: step.target,
    };
    this.notify();
  }

  // --- AUTH & LOGIN MODULE (Account & Password + PIN + Forgot Password OTP) ---
  public loginWithAccountAndPassword(
    accountNo: string,
    password: string
  ): { success: boolean; user?: User; notFound?: boolean; error?: string } {
    const trimmedAcc = accountNo.trim();
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Login',
      source: 'Login Boundary',
      target: 'AuthenticateService',
      message: `authenticate(accountNo: ${trimmedAcc})`,
      status: 'executing',
    });

    // 1. Verify if account or registered user exists in database
    const account = this.state.accounts.find(
      (a) => a.accountNo.toLowerCase() === trimmedAcc.toLowerCase()
    );

    const user = this.state.users.find(
      (u) =>
        (u.accountNo && u.accountNo.toLowerCase() === trimmedAcc.toLowerCase()) ||
        (account && u.customerId && u.customerId === account.customerId) ||
        (u.employeeId && `EMP${u.employeeId}`.toLowerCase() === trimmedAcc.toLowerCase()) ||
        (u.adminId && `ADM${u.adminId}`.toLowerCase() === trimmedAcc.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === trimmedAcc.toLowerCase())
    );

    if (!account && !user) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Login',
        source: 'AuthenticateService',
        target: 'Login Boundary',
        message: 'Account Not Found in Core Database',
        status: 'failed',
      });
      return {
        success: false,
        notFound: true,
        error: 'account not found kindly make sure You have register before login',
      };
    }

    const matchedUser = user || this.state.users.find((u) => account && u.customerId === account.customerId);

    if (!matchedUser) {
      return {
        success: false,
        notFound: true,
        error: 'account not found kindly make sure You have register before login',
      };
    }

    // 3. Verify password (or PIN)
    const expectedPassword = matchedUser.password || matchedUser.pin || 'password123';
    if (password !== expectedPassword && password !== matchedUser.pin) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Login',
        source: 'AuthenticateService',
        target: 'Login Boundary',
        message: 'validateCredentials(): Invalid Password',
        status: 'failed',
      });
      return {
        success: false,
        notFound: false,
        error: 'Incorrect password. Please verify your credentials or use Forgot Password.',
      };
    }

    this.state.currentUser = matchedUser;
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Login',
      source: 'AuthenticateService',
      target: 'Login Boundary',
      message: `validateSession(): Active, User: ${matchedUser.name} (${matchedUser.role})`,
      status: 'completed',
    });

    this.logAudit(
      matchedUser.name,
      matchedUser.role,
      'LOGIN_SUCCESS',
      'Login Module',
      `Logged in with Account ${trimmedAcc}`,
      'SUCCESS'
    );
    this.saveState();
    return { success: true, user: matchedUser };
  }

  public sendForgotPasswordOTP(
    accountNoOrPhone: string
  ): { success: boolean; notFound?: boolean; otp?: string; maskedPhone?: string; phone?: string; error?: string } {
    const term = accountNoOrPhone.trim().toLowerCase();

    const account = this.state.accounts.find(
      (a) => a.accountNo.toLowerCase() === term
    );
    const user = this.state.users.find(
      (u) =>
        (u.accountNo && u.accountNo.toLowerCase() === term) ||
        (u.phone && u.phone === term) ||
        (account && u.customerId === account.customerId)
    );

    if (!account && !user) {
      return {
        success: false,
        notFound: true,
        error: 'account not found kindly make sure You have register before login',
      };
    }

    const matchedAccountNo = account?.accountNo || user?.accountNo || 'ACC1001';
    const customer = this.state.customers.find(
      (c) => c.customerId === user?.customerId || (account && c.customerId === account.customerId)
    );
    const phone = user?.phone || customer?.phone || '9876543210';
    const maskedPhone = `+91 ${phone.slice(0, 2)}*** ${phone.slice(-4)}`;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.state.pendingPasswordReset = {
      accountNo: matchedAccountNo,
      otp,
      phone,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    this.sendNotification(
      phone,
      'SMS',
      `Your Digital Banking password reset OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`
    );

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Login',
      source: 'NotificationService',
      target: 'Customer Device Node',
      message: `Send Signal <Send SMS>: OTP generated for ${maskedPhone}`,
      status: 'completed',
    });

    this.saveState();
    return { success: true, otp, maskedPhone, phone };
  }

  public verifyOTPAndResetPassword(
    accountNo: string,
    otp: string,
    newPassword: string
  ): { success: boolean; error?: string } {
    const pending = this.state.pendingPasswordReset;
    if (!pending || pending.accountNo.toLowerCase() !== accountNo.trim().toLowerCase()) {
      return { success: false, error: 'No active OTP request found for this account. Please request a new OTP.' };
    }

    if (Date.now() > pending.expiresAt) {
      return { success: false, error: 'OTP expired. Please request a fresh OTP.' };
    }

    if (pending.otp !== otp.trim()) {
      return { success: false, error: 'Invalid OTP entered. Please check the code sent to your mobile.' };
    }

    const user = this.state.users.find(
      (u) => u.accountNo?.toLowerCase() === accountNo.trim().toLowerCase()
    );
    if (user) {
      user.password = newPassword;
      user.pin = newPassword.slice(0, 4);
    }

    this.state.pendingPasswordReset = undefined;
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Login',
      source: 'AuthenticateService',
      target: 'Customer Database',
      message: `Password updated successfully for account ${accountNo}`,
      status: 'completed',
    });

    this.logAudit(
      user?.name || 'Customer',
      'Customer',
      'PASSWORD_RESET_SUCCESS',
      'Login Module',
      `Reset password via SMS OTP for Account ${accountNo}`,
      'SUCCESS'
    );
    this.saveState();
    return { success: true };
  }

  public registerAccountWithDetails(details: {
    accountName: string;
    email: string;
    phone: string;
    password: string;
    accountType: AccountType;
    accountNo: string;
    initialBalance?: number;
  }): { success: boolean; user?: User; account?: Account; customer?: Customer; error?: string } {
    const trimmedAccNo = details.accountNo.trim().toUpperCase();

    if (this.state.accounts.some((a) => a.accountNo.toLowerCase() === trimmedAccNo.toLowerCase())) {
      return {
        success: false,
        error: `Account number ${trimmedAccNo} is already registered. Please choose another account number.`,
      };
    }

    if (this.state.users.some((u) => u.email.toLowerCase() === details.email.trim().toLowerCase())) {
      return {
        success: false,
        error: `Email address ${details.email} is already registered. Please log in or use forgot password.`,
      };
    }

    // Random initial balance between 1000 - 100000 by default (as per prompt point 6)
    const randomBalance =
      details.initialBalance ?? (Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000);

    const newCustomerId = 1000 + this.state.customers.length + 1;
    const newAccountId = 5000 + this.state.accounts.length + 1;

    const newCustomer: Customer = {
      customerId: newCustomerId,
      customerName: details.accountName.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0],
      customerType: 'Individual',
      addresses: [
        {
          addressId: 500 + newCustomerId,
          street: 'MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
        },
      ],
      contacts: [
        { contactId: 700 + newCustomerId, contactType: 'Email', value: details.email.trim() },
        { contactId: 701 + newCustomerId, contactType: 'Phone', value: details.phone.trim() },
      ],
      profile: {
        profileId: 300 + newCustomerId,
        occupation: 'Banking Customer',
        incomeRange: '10L_20L',
      },
      documents: [
        {
          documentId: 2000 + newCustomerId,
          documentType: 'Aadhaar Card',
          documentNumber: 'XXXX-XXXX-9911',
          issuedDate: '2022-01-01',
          expiryDate: '2032-01-01',
          status: 'verified',
        },
      ],
    };
    this.state.customers.push(newCustomer);

    let newAccount: Account;
    if (details.accountType === 'Current') {
      newAccount = {
        accountId: newAccountId,
        accountNo: trimmedAccNo,
        customerId: newCustomerId,
        accountType: 'Current',
        balance: randomBalance,
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        overdraftLimit: 50000,
      };
    } else if (details.accountType === 'Fixed') {
      newAccount = {
        accountId: newAccountId,
        accountNo: trimmedAccNo,
        customerId: newCustomerId,
        accountType: 'Fixed',
        balance: randomBalance,
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        interestRate: 7.2,
        tenureMonths: 12,
        maturityDate: '2026-10-17',
      };
    } else {
      newAccount = {
        accountId: newAccountId,
        accountNo: trimmedAccNo,
        customerId: newCustomerId,
        accountType: 'Savings',
        balance: randomBalance,
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        interestRate: 4.0,
      };
    }
    this.state.accounts.push(newAccount);

    const newUser: User = {
      userId: 10 + this.state.users.length + 1,
      name: details.accountName.trim(),
      email: details.email.trim(),
      password: details.password,
      pin: details.password.slice(0, 4) || '1234',
      phone: details.phone.trim(),
      role: 'Customer',
      customerId: newCustomerId,
      accountNo: trimmedAccNo,
    };
    this.state.users.push(newUser);

    const txnId = 1000 + this.state.transactions.length + 1;
    this.state.transactions.unshift({
      transactionId: txnId,
      accountNo: trimmedAccNo,
      type: 'Deposit',
      amount: randomBalance,
      transDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Welcome Deposit upon Registration (${newAccount.accountType})`,
      status: 'Success',
      referenceId: `TXN-REG-${txnId}`,
    });

    this.sendNotification(
      details.phone,
      'SMS',
      `Welcome to Digital Banking, ${details.accountName}! Your Account ${trimmedAccNo} is active with balance ₹${randomBalance.toLocaleString()}.`
    );

    this.state.currentUser = newUser;

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Customer',
      source: 'CustomerController',
      target: 'CustomerDatabase',
      message: `Registration successful: ${details.accountName} (Acc: ${trimmedAccNo}, Balance: ₹${randomBalance})`,
      status: 'completed',
    });

    this.logAudit(
      newUser.name,
      newUser.role,
      'REGISTER_ACCOUNT',
      'Customer Management',
      `Created Account ${trimmedAccNo} for ${details.accountName} with initial balance ₹${randomBalance}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, user: newUser, account: newAccount, customer: newCustomer };
  }

  public getAccountByNo(accountNo: string): Account | undefined {
    return this.state.accounts.find(
      (a) => a.accountNo.toLowerCase() === accountNo.trim().toLowerCase()
    );
  }

  // --- LEGACY PIN LOGIN ---
  public loginWithPin(emailOrUser: string, pin: string): { success: boolean; user?: User; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Login',
      source: 'Login Boundary',
      target: 'AuthenticateService',
      message: `authenticate(email/user: ${emailOrUser})`,
      status: 'executing',
    });

    const user = this.state.users.find(
      (u) => (u.email.toLowerCase() === emailOrUser.toLowerCase() || u.name.toLowerCase() === emailOrUser.toLowerCase())
    );

    if (!user) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Login',
        source: 'AuthenticateService',
        target: 'Login Boundary',
        message: 'validateCredentials(): User Not Found',
        status: 'failed',
      });
      return { success: false, error: 'User does not exist with this username or email.' };
    }

    if (user.pin !== pin) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Login',
        source: 'AuthenticateService',
        target: 'Login Boundary',
        message: 'validateCredentials(): Invalid PIN',
        status: 'failed',
      });
      return { success: false, error: 'Invalid PIN. Please try again or use Forgot PIN.' };
    }

    this.state.currentUser = user;
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Login',
      source: 'AuthenticateService',
      target: 'Login Boundary',
      message: `validateSession(): Active, Role: ${user.role}`,
      status: 'completed',
    });

    this.logAudit(user.name, user.role, 'LOGIN_SUCCESS', 'Login Module', `Logged in successfully as ${user.role}`, 'SUCCESS');
    this.saveState();
    return { success: true, user };
  }

  public switchRole(role: User['role']): void {
    const user = this.state.users.find((u) => u.role === role);
    if (user) {
      this.state.currentUser = user;
      this.logAudit(user.name, user.role, 'SWITCH_ROLE', 'Login Module', `Switched active persona to ${role}`, 'INFO');
      this.addUMLTrace({
        diagram: 'Component',
        module: 'Login',
        source: 'User Session',
        target: 'Application Server',
        message: `Switch persona to [${role}] (${user.name})`,
        status: 'completed',
      });
      this.saveState();
    }
  }

  public resetPin(email: string, newPin: string): { success: boolean; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Login',
      source: 'Login Boundary (Forgot PIN)',
      target: 'AuthenticateService',
      message: `Enter New PIN Number for ${email}`,
      status: 'executing',
    });

    const userIndex = this.state.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    this.state.users[userIndex].pin = newPin;
    if (this.state.currentUser && this.state.currentUser.email === email) {
      this.state.currentUser.pin = newPin;
    }

    this.logAudit(this.state.users[userIndex].name, this.state.users[userIndex].role, 'RESET_PIN', 'Login Module', 'User reset PIN credentials', 'SUCCESS');
    this.saveState();
    return { success: true };
  }

  public logout(): void {
    const user = this.state.currentUser;
    this.addUMLTrace({
      diagram: 'Statechart',
      module: 'Login',
      source: 'Session Boundary',
      target: 'Final State',
      message: 'closeSession(): Logout completed',
      status: 'completed',
    });
    if (user) {
      this.logAudit(user.name, user.role, 'LOGOUT', 'Login Module', 'Session terminated', 'SUCCESS');
    }
    // Switch to first available customer or guest
    this.state.currentUser = null;
    this.saveState();
  }

  // --- CUSTOMER MANAGEMENT (PDF 1, 2, 3, 4) ---
  public registerCustomer(customerData: {
    customerName: string;
    email: string;
    phone: string;
    customerType: Customer['customerType'];
    street: string;
    city: string;
    state: string;
    occupation: string;
    incomeRange: string;
    idDocType: Customer['documents'][0]['documentType'];
    idDocNumber: string;
    initialAccountType: AccountType;
    initialDeposit: number;
  }): { success: boolean; customer?: Customer; account?: Account; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Customer',
      source: 'CustomerUI',
      target: 'CustomerController',
      message: `submitDetails(name: ${customerData.customerName})`,
      status: 'executing',
    });

    // Validate details
    if (!customerData.customerName || !customerData.email || !customerData.phone) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Customer',
        source: 'CustomerController',
        target: 'CustomerUI',
        message: 'registrationFailed: Required fields empty',
        status: 'failed',
      });
      return { success: false, error: 'Customer name, email, and phone are strictly required.' };
    }

    // Check duplicate
    const exists = this.state.customers.some(
      (c) => c.email.toLowerCase() === customerData.email.toLowerCase() || c.phone === customerData.phone
    );
    if (exists) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Customer',
        source: 'CustomerController',
        target: 'CustomerDatabase',
        message: 'checkCustomerExists(): exists',
        status: 'failed',
      });
      return { success: false, error: 'A customer with this email or phone number already exists!' };
    }

    // Create Customer Entity
    const newCustomerId = 1000 + this.state.customers.length + 1;
    const newAddressId = 500 + this.state.customers.length + 1;
    const newContactId = 700 + this.state.customers.length * 2 + 1;
    const newDocId = 2000 + this.state.customers.length + 1;

    const newCustomer: Customer = {
      customerId: newCustomerId,
      customerName: customerData.customerName,
      email: customerData.email,
      phone: customerData.phone,
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0],
      customerType: customerData.customerType,
      addresses: [
        {
          addressId: newAddressId,
          street: customerData.street || 'Main Avenue',
          city: customerData.city || 'Bangalore',
          state: customerData.state || 'Karnataka',
        },
      ],
      contacts: [
        { contactId: newContactId, contactType: 'Email', value: customerData.email },
        { contactId: newContactId + 1, contactType: 'Phone', value: customerData.phone },
      ],
      profile: {
        profileId: 300 + newCustomerId,
        occupation: customerData.occupation || 'Professional',
        incomeRange: customerData.incomeRange || '10L_20L',
      },
      documents: [
        {
          documentId: newDocId,
          documentType: customerData.idDocType || 'Aadhaar Card',
          documentNumber: customerData.idDocNumber || 'XXXX-XXXX-8822',
          issuedDate: '2022-01-01',
          expiryDate: '2032-01-01',
          status: 'verified',
        },
      ],
    };

    this.state.customers.push(newCustomer);

    // Create User login account (Customer ── Login 1:1 association)
    const newAccountNo = `ACC${1000 + this.state.accounts.length + 1}`;
    const newUser: User = {
      userId: 10 + this.state.users.length + 1,
      name: newCustomer.customerName,
      email: newCustomer.email,
      pin: '1234',
      role: 'Customer',
      customerId: newCustomerId,
      accountNo: newAccountNo,
    };
    this.state.users.push(newUser);

    // Create Account (par Create Account in sequence diagram)
    const newAccountId = 5000 + this.state.accounts.length + 1;
    let newAccount: Account;

    if (customerData.initialAccountType === 'Current') {
      newAccount = {
        accountId: newAccountId,
        accountNo: newAccountNo,
        customerId: newCustomerId,
        accountType: 'Current',
        balance: Math.max(0, customerData.initialDeposit),
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        overdraftLimit: 50000.0,
      };
    } else if (customerData.initialAccountType === 'Fixed') {
      newAccount = {
        accountId: newAccountId,
        accountNo: newAccountNo,
        customerId: newCustomerId,
        accountType: 'Fixed',
        balance: Math.max(10000, customerData.initialDeposit || 10000),
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        interestRate: 7.2,
        tenureMonths: 12,
        maturityDate: '2025-10-17',
      };
    } else {
      newAccount = {
        accountId: newAccountId,
        accountNo: newAccountNo,
        customerId: newCustomerId,
        accountType: 'Savings',
        balance: Math.max(1000, customerData.initialDeposit || 1000),
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        interestRate: 4.0,
      };
    }

    this.state.accounts.push(newAccount);

    // Initial deposit transaction if > 0
    if (newAccount.balance > 0) {
      const txnId = 1000 + this.state.transactions.length + 1;
      this.state.transactions.unshift({
        transactionId: txnId,
        accountNo: newAccountNo,
        type: 'Deposit',
        amount: newAccount.balance,
        transDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description: `Initial Deposit upon Account Opening (${newAccount.accountType})`,
        status: 'Success',
        referenceId: `TXN-DEP-${txnId}`,
      });
    }

    // Notification Service (par sendRegistrationNotification)
    this.sendNotification(
      newCustomer.email,
      'Email',
      `Welcome to Apex Bank, ${newCustomer.customerName}! Your customer ID is ${newCustomerId} and Primary Account is ${newAccountNo}. Default PIN: 1234.`
    );

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Customer',
      source: 'NotificationService',
      target: 'CustomerUI',
      message: `registrationSuccess: ID=${newCustomerId}, Account=${newAccountNo}`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || 'Bank Employee',
      this.state.currentUser?.role || 'Bank Employee',
      'REGISTER_CUSTOMER',
      'Customer Management',
      `Registered Customer #${newCustomerId} (${newCustomer.customerName}), primary account ${newAccountNo}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, customer: newCustomer, account: newAccount };
  }

  public updateCustomerDetails(
    customerId: number,
    updates: {
      customerName?: string;
      phone?: string;
      occupation?: string;
      incomeRange?: string;
      street?: string;
      city?: string;
      state?: string;
    }
  ): { success: boolean; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Customer',
      source: 'CustomerUI',
      target: 'CustomerController',
      message: `updateCustomer(id: ${customerId})`,
      status: 'executing',
    });

    const index = this.state.customers.findIndex((c) => c.customerId === customerId);
    if (index === -1) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Customer',
        source: 'CustomerController',
        target: 'CustomerUI',
        message: 'customerNotFound',
        status: 'failed',
      });
      return { success: false, error: 'Customer not found.' };
    }

    const cust = this.state.customers[index];
    if (updates.customerName) cust.customerName = updates.customerName;
    if (updates.phone) cust.phone = updates.phone;
    if (updates.occupation && cust.profile) cust.profile.occupation = updates.occupation;
    if (updates.incomeRange && cust.profile) cust.profile.incomeRange = updates.incomeRange;
    if (cust.addresses.length > 0) {
      if (updates.street) cust.addresses[0].street = updates.street;
      if (updates.city) cust.addresses[0].city = updates.city;
      if (updates.state) cust.addresses[0].state = updates.state;
    }

    // Update user display name as well
    const user = this.state.users.find((u) => u.customerId === customerId);
    if (user && updates.customerName) {
      user.name = updates.customerName;
    }

    this.sendNotification(cust.email, 'Email', `Profile updated successfully for customer #${customerId}`);

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Customer',
      source: 'CustomerController',
      target: 'CustomerUI',
      message: 'updateSuccessful',
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || 'Bank Employee',
      this.state.currentUser?.role || 'Bank Employee',
      'UPDATE_CUSTOMER',
      'Customer Management',
      `Updated details for Customer #${customerId} (${cust.customerName})`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true };
  }

  public setCustomerStatus(customerId: number, newStatus: Customer['status']): { success: boolean } {
    const cust = this.state.customers.find((c) => c.customerId === customerId);
    if (!cust) return { success: false };

    cust.status = newStatus;
    this.addUMLTrace({
      diagram: 'Statechart',
      module: 'Customer',
      source: 'CustomerController',
      target: newStatus,
      message: `Customer state transition: ${newStatus}`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || 'Bank Staff',
      this.state.currentUser?.role || 'Bank Staff',
      'SET_CUSTOMER_STATUS',
      'Customer Management',
      `Status updated to ${newStatus} for Customer #${customerId}`,
      'SUCCESS'
    );
    this.saveState();
    return { success: true };
  }

  // --- ACCOUNT MANAGEMENT (PDF 1, 2, 4) ---
  public openAccount(
    customerId: number,
    accountType: AccountType,
    initialDeposit: number
  ): { success: boolean; account?: Account; error?: string } {
    this.addUMLTrace({
      diagram: 'Component',
      module: 'Account',
      source: 'AccountUI',
      target: 'Open Account Processor',
      message: `Open Account (${accountType}) for CustID: ${customerId}`,
      status: 'executing',
    });

    const cust = this.state.customers.find((c) => c.customerId === customerId);
    if (!cust) return { success: false, error: 'Customer not found!' };

    // Minimum balance constraint check
    const minBalance = accountType === 'Fixed' ? 10000 : accountType === 'Current' ? 5000 : 1000;
    if (initialDeposit < minBalance) {
      return {
        success: false,
        error: `Minimum balance constraint: Initial deposit for a ${accountType} Account must be at least ₹${minBalance.toLocaleString()}.`,
      };
    }

    const newAccountNo = accountType === 'Fixed' ? `FD${1000 + this.state.accounts.length + 1}` : `ACC${1000 + this.state.accounts.length + 1}`;
    const newAccountId = 5000 + this.state.accounts.length + 1;

    let account: Account;
    if (accountType === 'Current') {
      account = {
        accountId: newAccountId,
        accountNo: newAccountNo,
        customerId,
        accountType: 'Current',
        balance: initialDeposit,
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        overdraftLimit: 50000.0,
      };
    } else if (accountType === 'Fixed') {
      account = {
        accountId: newAccountId,
        accountNo: newAccountNo,
        customerId,
        accountType: 'Fixed',
        balance: initialDeposit,
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        interestRate: 7.2,
        tenureMonths: 24,
        maturityDate: '2026-10-17',
      };
    } else {
      account = {
        accountId: newAccountId,
        accountNo: newAccountNo,
        customerId,
        accountType: 'Savings',
        balance: initialDeposit,
        openDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        interestRate: 4.0,
      };
    }

    this.state.accounts.push(account);

    const txnId = 1000 + this.state.transactions.length + 1;
    this.state.transactions.unshift({
      transactionId: txnId,
      accountNo: newAccountNo,
      type: 'Deposit',
      amount: initialDeposit,
      transDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Initial Deposit upon opening ${accountType} account`,
      status: 'Success',
      referenceId: `TXN-DEP-${txnId}`,
    });

    this.sendNotification(
      cust.email,
      'Email',
      `New ${accountType} Account ${newAccountNo} successfully created with opening balance of ₹${initialDeposit.toLocaleString()}.`
    );

    this.addUMLTrace({
      diagram: 'Component',
      module: 'Account',
      source: 'Account Service',
      target: 'Account Database',
      message: `AccountCreated: ${newAccountNo}`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || 'Staff',
      this.state.currentUser?.role || 'Staff',
      'OPEN_ACCOUNT',
      'Account Management',
      `Opened ${accountType} Account ${newAccountNo} for Customer #${customerId}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, account };
  }

  public closeAccount(accountNo: string): { success: boolean; error?: string } {
    this.addUMLTrace({
      diagram: 'Component',
      module: 'Account',
      source: 'Close Account Processor',
      target: 'Account Database',
      message: `closeAccount(${accountNo})`,
      status: 'executing',
    });

    const account = this.state.accounts.find((a) => a.accountNo === accountNo);
    if (!account) return { success: false, error: 'Account not found.' };

    if (account.balance > 0) {
      return {
        success: false,
        error: `Cannot close account with positive balance of ₹${account.balance.toLocaleString()}. Please withdraw or transfer funds first.`,
      };
    }

    account.status = 'Closed';
    this.addUMLTrace({
      diagram: 'Statechart',
      module: 'Account',
      source: 'Account Service',
      target: 'Account Closed',
      message: `Account ${accountNo} closed`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || 'Staff',
      this.state.currentUser?.role || 'Staff',
      'CLOSE_ACCOUNT',
      'Account Management',
      `Closed Account ${accountNo}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true };
  }

  public deleteAccount(accountNo: string): { success: boolean; error?: string } {
    const idx = this.state.accounts.findIndex(
      (a) => a.accountNo.trim().toUpperCase() === accountNo.trim().toUpperCase()
    );
    if (idx === -1) return { success: false, error: 'Account not found.' };

    const deletedAccount = this.state.accounts[idx];
    this.state.accounts.splice(idx, 1);

    // If user's primary account was deleted, update or clear it
    if (
      this.state.currentUser &&
      this.state.currentUser.accountNo?.trim().toUpperCase() === accountNo.trim().toUpperCase()
    ) {
      const nextAcc = this.state.accounts.find(
        (a) => a.customerId === this.state.currentUser?.customerId
      );
      this.state.currentUser.accountNo = nextAcc ? nextAcc.accountNo : undefined;
    }

    this.logAudit(
      this.state.currentUser?.name || 'User',
      this.state.currentUser?.role || 'Customer',
      'DELETE_ACCOUNT',
      'Account Management',
      `Permanently deleted Account ${accountNo} (${deletedAccount.accountType})`,
      'SUCCESS'
    );

    this.sendNotification(
      this.state.currentUser?.phone || 'Customer',
      'SMS',
      `Account ${accountNo} (${deletedAccount.accountType}) has been permanently deleted from your banking profile.`
    );

    this.saveState();
    return { success: true };
  }

  public applyMonthlySavingsInterest(accountNo: string): { success: boolean; interestAdded?: number; error?: string } {
    const account = this.state.accounts.find((a) => a.accountNo === accountNo);
    if (!account || account.accountType !== 'Savings') {
      return { success: false, error: 'Valid savings account required.' };
    }

    const interest = calculateSavingsInterest(account.balance, account.interestRate, 30);
    if (interest <= 0) {
      return { success: false, error: 'Balance too low to accrue interest.' };
    }

    account.balance = Math.round((account.balance + interest) * 100) / 100;
    const txnId = 1000 + this.state.transactions.length + 1;
    this.state.transactions.unshift({
      transactionId: txnId,
      accountNo,
      type: 'Deposit',
      amount: interest,
      transDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: `Monthly Interest Credited @ ${account.interestRate}% p.a.`,
      status: 'Success',
      referenceId: `INT-${txnId}`,
    });

    this.addUMLTrace({
      diagram: 'Class',
      module: 'Account',
      source: 'SavingsAccount',
      target: 'Account Balance',
      message: `calculateInterest(): Credited ₹${interest}`,
      status: 'completed',
    });

    this.saveState();
    return { success: true, interestAdded: interest };
  }

  // --- TRANSACTION MANAGEMENT (PDF 3 & 4: Sequence, Activity, Statechart) ---
  public deposit(
    accountNo: string,
    amount: number,
    description: string = 'Cash Deposit via Branch / Counter'
  ): { success: boolean; receipt?: Receipt; newBalance?: number; error?: string } {
    // 1. TransactionUI -> TransactionController : processDeposit(accountNo, amount)
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Transaction',
      source: 'TransactionUI',
      target: 'TransactionController',
      message: `deposit(${accountNo}, ₹${amount})`,
      status: 'executing',
    });

    if (amount <= 0) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Transaction',
        source: 'TransactionController',
        target: 'TransactionUI',
        message: 'validateInput: Invalid deposit amount',
        status: 'failed',
      });
      return { success: false, error: 'Deposit amount must be greater than zero.' };
    }

    // 1.2 getAccount(accountNo)
    const account = this.state.accounts.find((a) => a.accountNo === accountNo);
    if (!account) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Transaction',
        source: 'TransactionController',
        target: 'TransactionUI',
        message: 'depositFailed("Account Not Found")',
        note: 'break [invalid account]',
        status: 'failed',
      });
      return { success: false, error: 'Deposit failed: Account Not Found.' };
    }

    if (account.status !== 'Active') {
      return { success: false, error: `Account ${accountNo} is currently ${account.status}. Deposits not permitted.` };
    }

    // critical updateBalance(+amount)
    account.balance = Math.round((account.balance + amount) * 100) / 100;
    const newBal = account.balance;

    // loop [for each transaction record] -> saveTransactionRecord()
    const txnId = 1000 + this.state.transactions.length + 1;
    const receiptId = 9000 + this.state.receipts.length + 1;
    const refNumber = `TXN-DEP-${txnId}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const transaction: Transaction = {
      transactionId: txnId,
      accountNo,
      type: 'Deposit',
      amount,
      transDate: timestamp,
      description,
      status: 'Success',
      receiptId,
      referenceId: refNumber,
    };
    this.state.transactions.unshift(transaction);

    // strict group: generateReceipt()
    const cust = this.state.customers.find((c) => c.customerId === account.customerId);
    const receipt: Receipt = {
      receiptId,
      receiptDate: timestamp,
      amount,
      receiptType: 'Deposit',
      accountNo,
      customerName: cust?.customerName || 'Customer',
      referenceNumber: refNumber,
      details: {
        transactionType: 'Cash Deposit',
        newBalance: newBal,
        serviceChannel: 'Apex Branch / Online Gateway',
      },
    };
    this.state.receipts.unshift(receipt);

    // opt [notification enabled]: sendNotification()
    this.sendNotification(
      cust?.email || 'customer@apexbank.com',
      'SMS',
      `Deposit Successful: ₹${amount.toLocaleString()} credited to ${accountNo}. New Balance: ₹${newBal.toLocaleString()}. Ref: ${refNumber}`
    );

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Transaction',
      source: 'TransactionController',
      target: 'Receipt',
      message: `generateReceipt(): Receipt #${receiptId} generated`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || cust?.customerName || 'Customer',
      this.state.currentUser?.role || 'Customer',
      'DEPOSIT',
      'Transaction Details',
      `Deposited ₹${amount.toLocaleString()} into ${accountNo}. Closing balance: ₹${newBal.toLocaleString()}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, receipt, newBalance: newBal };
  }

  public withdraw(
    accountNo: string,
    amount: number,
    description: string = 'ATM / Cash Withdrawal'
  ): { success: boolean; receipt?: Receipt; newBalance?: number; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Transaction',
      source: 'TransactionUI',
      target: 'TransactionController',
      message: `withdraw(${accountNo}, ₹${amount})`,
      status: 'executing',
    });

    if (amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than zero.' };
    }

    const account = this.state.accounts.find((a) => a.accountNo === accountNo);
    if (!account) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Transaction',
        source: 'TransactionController',
        target: 'TransactionUI',
        message: 'withdrawFailed("Account Not Found")',
        note: 'break [invalid account]',
        status: 'failed',
      });
      return { success: false, error: 'Withdrawal failed: Account Not Found.' };
    }

    if (account.status !== 'Active') {
      return { success: false, error: `Account ${accountNo} is ${account.status}. Withdrawals not permitted.` };
    }

    // Balance & Overdraft check
    const overdraft = account.accountType === 'Current' ? account.overdraftLimit : 0;
    const overdraftCheck = checkOverdraftLimit(account.balance, overdraft, amount);

    if (!overdraftCheck.allowed) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Transaction',
        source: 'TransactionController',
        target: 'TransactionUI',
        message: 'withdrawFailed("Insufficient Balance")',
        note: 'break [insufficient balance]',
        status: 'failed',
      });
      return { success: false, error: overdraftCheck.reason || 'Insufficient Balance!' };
    }

    // Critical updateBalance(-amount)
    account.balance = Math.round((account.balance - amount) * 100) / 100;
    const newBal = account.balance;

    const txnId = 1000 + this.state.transactions.length + 1;
    const receiptId = 9000 + this.state.receipts.length + 1;
    const refNumber = `TXN-WTH-${txnId}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const transaction: Transaction = {
      transactionId: txnId,
      accountNo,
      type: 'Withdraw',
      amount,
      transDate: timestamp,
      description,
      status: 'Success',
      receiptId,
      referenceId: refNumber,
    };
    this.state.transactions.unshift(transaction);

    const cust = this.state.customers.find((c) => c.customerId === account.customerId);
    const receipt: Receipt = {
      receiptId,
      receiptDate: timestamp,
      amount,
      receiptType: 'Withdraw',
      accountNo,
      customerName: cust?.customerName || 'Customer',
      referenceNumber: refNumber,
      details: {
        withdrawalMode: 'ATM / Cash Dispense',
        newBalance: newBal,
        atmTerminal: 'ATM-CHN-004',
      },
    };
    this.state.receipts.unshift(receipt);

    this.sendNotification(
      cust?.email || 'customer@apexbank.com',
      'SMS',
      `Withdrawal Alert: ₹${amount.toLocaleString()} debited from ${accountNo}. New Balance: ₹${newBal.toLocaleString()}. Ref: ${refNumber}`
    );

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Transaction',
      source: 'TransactionController',
      target: 'Receipt',
      message: `displayResult(newBalance: ₹${newBal})`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || cust?.customerName || 'Customer',
      this.state.currentUser?.role || 'Customer',
      'WITHDRAW',
      'Transaction Details',
      `Debited ₹${amount.toLocaleString()} from ${accountNo}. Balance: ₹${newBal.toLocaleString()}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, receipt, newBalance: newBal };
  }

  public fundTransfer(
    fromAccountNo: string,
    toAccountNo: string,
    amount: number,
    remarks: string = 'Inter-Account Fund Transfer'
  ): { success: boolean; receipt?: Receipt; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Transaction',
      source: 'TransactionUI',
      target: 'TransactionController',
      message: `processTransfer(from: ${fromAccountNo}, to: ${toAccountNo}, amount: ₹${amount})`,
      status: 'executing',
    });

    if (amount <= 0) return { success: false, error: 'Transfer amount must be positive.' };
    if (fromAccountNo === toAccountNo) return { success: false, error: 'Source and destination accounts cannot be identical.' };

    const fromAcc = this.state.accounts.find((a) => a.accountNo === fromAccountNo);
    const toAcc = this.state.accounts.find((a) => a.accountNo === toAccountNo);

    if (!fromAcc || !toAcc) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Transaction',
        source: 'TransactionController',
        target: 'TransactionUI',
        message: 'transferFailed("Account Not Found")',
        status: 'failed',
      });
      return { success: false, error: 'Transfer failed: One or both accounts do not exist in the Core Banking System.' };
    }

    if (fromAcc.status !== 'Active' || toAcc.status !== 'Active') {
      return { success: false, error: 'Both accounts must be Active to complete a transfer.' };
    }

    // Check balance
    const overdraft = fromAcc.accountType === 'Current' ? fromAcc.overdraftLimit : 0;
    const overdraftCheck = checkOverdraftLimit(fromAcc.balance, overdraft, amount);
    if (!overdraftCheck.allowed) {
      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Transaction',
        source: 'TransactionController',
        target: 'TransactionUI',
        message: 'transferFailed("Insufficient Balance")',
        status: 'failed',
      });
      return { success: false, error: overdraftCheck.reason || 'Insufficient balance for transfer.' };
    }

    // Atomic Execution: Debit Sender, Credit Receiver
    fromAcc.balance = Math.round((fromAcc.balance - amount) * 100) / 100;
    toAcc.balance = Math.round((toAcc.balance + amount) * 100) / 100;

    const txnId = 1000 + this.state.transactions.length + 1;
    const receiptId = 9000 + this.state.receipts.length + 1;
    const refNumber = `TXN-TRF-${txnId}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const senderCust = this.state.customers.find((c) => c.customerId === fromAcc.customerId);
    const receiverCust = this.state.customers.find((c) => c.customerId === toAcc.customerId);

    // Save transactions
    this.state.transactions.unshift({
      transactionId: txnId,
      accountNo: fromAccountNo,
      type: 'Transfer',
      amount,
      transDate: timestamp,
      description: `Fund Transfer to ${toAccountNo} (${receiverCust?.customerName || 'Recipient'}) - ${remarks}`,
      status: 'Success',
      fromAccountNo,
      toAccountNo,
      receiptId,
      referenceId: refNumber,
    });

    const receipt: Receipt = {
      receiptId,
      receiptDate: timestamp,
      amount,
      receiptType: 'Fund Transfer',
      accountNo: fromAccountNo,
      customerName: senderCust?.customerName || 'Customer',
      referenceNumber: refNumber,
      details: {
        fromAccount: `${fromAccountNo} (${senderCust?.customerName})`,
        toAccount: `${toAccountNo} (${receiverCust?.customerName})`,
        senderClosingBalance: fromAcc.balance,
        transferGateway: 'Instant Core Bank Clearing Service',
      },
    };
    this.state.receipts.unshift(receipt);

    // Send notifications to both
    if (senderCust?.email) {
      this.sendNotification(
        senderCust.email,
        'Email',
        `Fund Transfer Successful: Sent ₹${amount.toLocaleString()} to ${toAccountNo}. New Balance: ₹${fromAcc.balance.toLocaleString()}. Ref: ${refNumber}`
      );
    }
    if (receiverCust?.email) {
      this.sendNotification(
        receiverCust.email,
        'Email',
        `Fund Transfer Received: ₹${amount.toLocaleString()} credited from ${fromAccountNo} (${senderCust?.customerName}). New Balance: ₹${toAcc.balance.toLocaleString()}`
      );
    }

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Transaction',
      source: 'TransactionController',
      target: 'Receipt',
      message: `updateTransactionStatus("SUCCESS") & generateReceipt()`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || senderCust?.customerName || 'Customer',
      this.state.currentUser?.role || 'Customer',
      'TRANSFER',
      'Transaction Details',
      `Transferred ₹${amount.toLocaleString()} from ${fromAccountNo} to ${toAccountNo}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, receipt };
  }

  // --- PAYMENT MANAGEMENT (PDF 1, 2, 3, 4: UPI, Card, Net Banking) ---
  public makePayment(paymentData: {
    fromAccountNo: string;
    paymentType: PaymentType;
    paymentMode: PaymentMode;
    amount: number;
    payeeDetails: string;
  }): { success: boolean; receipt?: Receipt; error?: string } {
    this.addUMLTrace({
      diagram: 'Component',
      module: 'Payment',
      source: 'Payment UI',
      target: 'Payment Controller',
      message: `validatePayment(mode: ${paymentData.paymentMode}, type: ${paymentData.paymentType}, amount: ₹${paymentData.amount})`,
      status: 'executing',
    });

    if (paymentData.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    // Daily limit checks (e.g. UPI max 1,00,000 per txn)
    if (paymentData.paymentMode === 'UPI' && paymentData.amount > 100000) {
      this.addUMLTrace({
        diagram: 'Activity',
        module: 'Payment',
        source: 'Payment Service',
        target: 'Exception/Interrupt Flow',
        message: 'Limit Exceeded: UPI single transaction cap is ₹1,00,000',
        status: 'failed',
      });
      return { success: false, error: 'UPI transaction limit exceeded. Maximum single transaction limit is ₹1,00,000.' };
    }

    const account = this.state.accounts.find((a) => a.accountNo === paymentData.fromAccountNo);
    if (!account) {
      this.addUMLTrace({
        diagram: 'Activity',
        module: 'Payment',
        source: 'Account Service',
        target: 'Invalid Account State',
        message: 'Send Signal Account Invalid',
        status: 'failed',
      });
      return { success: false, error: 'Account invalid or not found.' };
    }

    const overdraft = account.accountType === 'Current' ? account.overdraftLimit : 0;
    const overdraftCheck = checkOverdraftLimit(account.balance, overdraft, paymentData.amount);
    if (!overdraftCheck.allowed) {
      this.addUMLTrace({
        diagram: 'Activity',
        module: 'Payment',
        source: 'Account Service',
        target: 'Insufficient Funds State',
        message: 'Send Signal Insufficient Funds',
        status: 'failed',
      });
      return { success: false, error: overdraftCheck.reason || 'Insufficient funds in selected account.' };
    }

    // Debit Account
    account.balance = Math.round((account.balance - paymentData.amount) * 100) / 100;

    const paymentId = 6000 + this.state.payments.length + 1;
    const receiptId = 9000 + this.state.receipts.length + 1;
    const refNumber = `PAY-${paymentData.paymentMode}-${paymentId}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const paymentRecord: PaymentRecord = {
      paymentId,
      accountNo: paymentData.fromAccountNo,
      paymentType: paymentData.paymentType,
      paymentMode: paymentData.paymentMode,
      amount: paymentData.amount,
      payeeDetails: paymentData.payeeDetails,
      paymentDate: timestamp,
      status: 'Success',
      receiptId,
    };
    this.state.payments.unshift(paymentRecord);

    const txnId = 1000 + this.state.transactions.length + 1;
    this.state.transactions.unshift({
      transactionId: txnId,
      accountNo: paymentData.fromAccountNo,
      type: 'Payment',
      amount: paymentData.amount,
      transDate: timestamp,
      description: `${paymentData.paymentType} via ${paymentData.paymentMode} to ${paymentData.payeeDetails}`,
      status: 'Success',
      receiptId,
      referenceId: refNumber,
    });

    const cust = this.state.customers.find((c) => c.customerId === account.customerId);
    const receipt: Receipt = {
      receiptId,
      receiptDate: timestamp,
      amount: paymentData.amount,
      receiptType: 'Payment',
      accountNo: paymentData.fromAccountNo,
      customerName: cust?.customerName || 'Customer',
      paymentMode: paymentData.paymentMode,
      referenceNumber: refNumber,
      details: {
        paymentType: paymentData.paymentType,
        payee: paymentData.payeeDetails,
        paymentGateway: `${paymentData.paymentMode} Gateway Processor`,
        newBalance: account.balance,
      },
    };
    this.state.receipts.unshift(receipt);

    this.sendNotification(
      cust?.email || 'customer@apexbank.com',
      'SMS',
      `Payment Successful: ₹${paymentData.amount.toLocaleString()} paid towards ${paymentData.payeeDetails} using ${paymentData.paymentMode}. Ref: ${refNumber}`
    );

    this.addUMLTrace({
      diagram: 'Component',
      module: 'Payment',
      source: 'Payment Service',
      target: 'Payment Receipt',
      message: `Payment Completed & Receipt #${receiptId} Generated`,
      status: 'completed',
    });

    this.logAudit(
      this.state.currentUser?.name || cust?.customerName || 'Customer',
      this.state.currentUser?.role || 'Customer',
      'PAYMENT_SUCCESS',
      'Payment Management',
      `Paid ₹${paymentData.amount.toLocaleString()} for ${paymentData.payeeDetails} (${paymentData.paymentMode})`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, receipt };
  }

  // --- LOAN MANAGEMENT MODULE (PDF 1, 2, 3, 4) ---
  public submitLoanApplication(data: {
    customerId: number;
    loanType: LoanType;
    requestedAmount: number;
    tenureMonths: number;
    linkedAccountNo: string;
    collateralType?: string;
    collateralValue?: number;
    collateralDocNo?: string;
    guarantorName?: string;
    guarantorRelationship?: string;
    guarantorPhone?: string;
  }): { success: boolean; application?: LoanApplication; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Loan',
      source: 'Loan UI',
      target: 'LoanController',
      message: `submitApplication(${data.loanType}, ₹${data.requestedAmount}, ${data.tenureMonths}m)`,
      status: 'executing',
    });

    const cust = this.state.customers.find((c) => c.customerId === data.customerId);
    if (!cust) return { success: false, error: 'Customer not found.' };

    if (data.requestedAmount <= 10000 || data.tenureMonths <= 0) {
      return { success: false, error: 'Requested loan amount must be at least ₹10,000 with a valid tenure.' };
    }

    // Credit Bureau check simulation (generates realistic credit score based on customer profile)
    const baseScore = cust.status === 'Active' ? 760 : 640;
    const creditScore = Math.min(850, Math.max(550, baseScore + Math.floor(Math.random() * 60) - 20));

    const appId = 4000 + this.state.loanApplications.length + 1;
    const application: LoanApplication = {
      applicationId: appId,
      customerId: data.customerId,
      customerName: cust.customerName,
      loanType: data.loanType,
      requestedAmount: data.requestedAmount,
      tenureMonths: data.tenureMonths,
      status: 'SUBMITTED',
      applicationDate: new Date().toISOString().split('T')[0],
      creditScore,
      linkedAccountNo: data.linkedAccountNo,
    };

    if (data.collateralType && data.collateralValue) {
      application.collateral = {
        collateralId: 3000 + appId,
        collateralType: data.collateralType,
        collateralValue: data.collateralValue,
        documentNo: data.collateralDocNo || `DOC-${appId}`,
      };
    }

    if (data.guarantorName) {
      application.guarantor = {
        guarantorId: 4000 + appId,
        guarantorName: data.guarantorName,
        relationship: data.guarantorRelationship || 'Family',
        contactNumber: data.guarantorPhone || '9876543210',
      };
    }

    this.state.loanApplications.unshift(application);

    // Document Management & Credit Bureau verification
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Loan',
      source: 'LoanController',
      target: 'Credit Bureau Service',
      message: `performCreditCheck(): Score=${creditScore}`,
      status: 'completed',
    });

    this.sendNotification(
      cust.email,
      'Email',
      `Loan Application #${appId} for ₹${data.requestedAmount.toLocaleString()} (${data.loanType}) has been submitted for review. Credit Bureau score: ${creditScore}.`
    );

    this.logAudit(
      cust.customerName,
      'Customer',
      'APPLY_LOAN',
      'Loan Process',
      `Submitted Loan Application #${appId} for ₹${data.requestedAmount.toLocaleString()}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, application };
  }

  public reviewLoanApplication(
    applicationId: number,
    decision: 'APPROVE' | 'REJECT',
    officerNotes?: string
  ): { success: boolean; loan?: Loan; error?: string } {
    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Loan',
      source: 'Bank Officer',
      target: 'LoanController',
      message: `reviewApplication(appId: ${applicationId}, decision: ${decision})`,
      status: 'executing',
    });

    const app = this.state.loanApplications.find((a) => a.applicationId === applicationId);
    if (!app) return { success: false, error: 'Application not found.' };

    const cust = this.state.customers.find((c) => c.customerId === app.customerId);
    const officer = this.state.currentUser?.name || 'Loan Officer';

    if (decision === 'REJECT') {
      app.status = 'REJECTED';
      app.rejectionReason = officerNotes || 'Application does not meet current credit risk parameters.';

      this.sendNotification(
        cust?.email || 'customer@apexbank.com',
        'Email',
        `Loan Application #${applicationId} was not approved. Reason: ${app.rejectionReason}`
      );

      this.addUMLTrace({
        diagram: 'Sequence',
        module: 'Loan',
        source: 'LoanController',
        target: 'NotificationService',
        message: 'sendRejectionNotification()',
        status: 'completed',
      });

      this.logAudit(officer, 'Bank Officer', 'REJECT_LOAN', 'Loan Process', `Rejected Application #${applicationId}: ${app.rejectionReason}`, 'INFO');
      this.saveState();
      return { success: true };
    }

    // APPROVE & DISBURSE (par parallel activities in sequence diagram)
    app.status = 'APPROVED';

    // Base interest rate
    let interestRate = 8.5;
    if (app.creditScore >= 780) interestRate = 8.0;
    else if (app.creditScore < 680) interestRate = 9.5;

    const emi = calculateLoanEMI(app.requestedAmount, interestRate, app.tenureMonths);
    const newLoanId = 7000 + this.state.loans.length + 1;

    const loan: Loan = {
      loanId: newLoanId,
      applicationId: app.applicationId,
      customerId: app.customerId,
      accountNo: app.linkedAccountNo,
      loanType: app.loanType,
      loanAmount: app.requestedAmount,
      interestRate,
      tenureMonths: app.tenureMonths,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      emiAmount: emi,
      remainingAmount: app.requestedAmount,
      collateral: app.collateral,
      guarantor: app.guarantor,
    };
    this.state.loans.unshift(loan);

    // Generate EMI Schedule entries
    const schedules = generateEMIScheduleList(newLoanId, app.requestedAmount, interestRate, app.tenureMonths);
    this.state.emiSchedules.push(...schedules);

    // Disburse funds directly into customer's linked account (par disburseLoanAmount)
    const targetAccount = this.state.accounts.find((a) => a.accountNo === app.linkedAccountNo);
    if (targetAccount) {
      targetAccount.balance = Math.round((targetAccount.balance + app.requestedAmount) * 100) / 100;

      const txnId = 1000 + this.state.transactions.length + 1;
      this.state.transactions.unshift({
        transactionId: txnId,
        accountNo: app.linkedAccountNo,
        type: 'Deposit',
        amount: app.requestedAmount,
        transDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        description: `Loan Disbursement: ${app.loanType} #${newLoanId}`,
        status: 'Success',
        referenceId: `LOAN-DISB-${newLoanId}`,
      });
    }

    this.sendNotification(
      cust?.email || 'customer@apexbank.com',
      'Email',
      `Congratulations! Your ${app.loanType} of ₹${app.requestedAmount.toLocaleString()} is APPROVED and DISBURSED to ${app.linkedAccountNo}. Monthly EMI: ₹${emi.toLocaleString()}.`
    );

    this.addUMLTrace({
      diagram: 'Sequence',
      module: 'Loan',
      source: 'LoanController',
      target: 'Core Banking System',
      message: `disburseLoanAmount(₹${app.requestedAmount}) -> Account ${app.linkedAccountNo}`,
      status: 'completed',
    });

    this.logAudit(
      officer,
      'Bank Officer',
      'APPROVE_AND_DISBURSE_LOAN',
      'Loan Process',
      `Approved and disbursed ₹${app.requestedAmount.toLocaleString()} for Loan #${newLoanId}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, loan };
  }

  public payLoanEMI(
    loanId: number,
    emiId: number,
    fromAccountNo: string,
    paymentMode: PaymentMode = 'Net Banking'
  ): { success: boolean; receipt?: Receipt; error?: string } {
    this.addUMLTrace({
      diagram: 'Statechart',
      module: 'Loan',
      source: 'Make EMI Payment',
      target: 'Validate Payment',
      message: `payEMI(loan: #${loanId}, emi: #${emiId})`,
      status: 'executing',
    });

    const loan = this.state.loans.find((l) => l.loanId === loanId);
    if (!loan) return { success: false, error: 'Loan not found.' };

    const emiSchedule = this.state.emiSchedules.find((s) => s.emiId === emiId && s.loanId === loanId);
    if (!emiSchedule) return { success: false, error: 'EMI installment not found.' };

    if (emiSchedule.status === 'Paid') {
      return { success: false, error: 'This EMI installment has already been paid.' };
    }

    const account = this.state.accounts.find((a) => a.accountNo === fromAccountNo);
    if (!account) return { success: false, error: 'Paying account not found.' };

    const overdraft = account.accountType === 'Current' ? account.overdraftLimit : 0;
    const overdraftCheck = checkOverdraftLimit(account.balance, overdraft, emiSchedule.emiAmount);
    if (!overdraftCheck.allowed) {
      return { success: false, error: overdraftCheck.reason || 'Insufficient funds in paying account.' };
    }

    // Debit Account
    account.balance = Math.round((account.balance - emiSchedule.emiAmount) * 100) / 100;

    // Update EMI Status
    emiSchedule.status = 'Paid';
    emiSchedule.paidAmount = emiSchedule.emiAmount;
    emiSchedule.paidDate = new Date().toISOString().split('T')[0];

    // Deduct principal from remaining balance
    loan.remainingAmount = Math.max(0, Math.round((loan.remainingAmount - emiSchedule.principalAmount) * 100) / 100);
    if (loan.remainingAmount === 0) {
      loan.status = 'CLOSED';
    }

    const receiptId = 9000 + this.state.receipts.length + 1;
    const refNumber = `EMI-RCPT-${receiptId}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const cust = this.state.customers.find((c) => c.customerId === loan.customerId);
    const receipt: Receipt = {
      receiptId,
      receiptDate: timestamp,
      amount: emiSchedule.emiAmount,
      receiptType: 'Loan EMI',
      accountNo: fromAccountNo,
      customerName: cust?.customerName || 'Customer',
      paymentMode,
      referenceNumber: refNumber,
      details: {
        loanId,
        installmentNumber: emiSchedule.installmentNumber,
        principalPortion: emiSchedule.principalAmount,
        interestPortion: emiSchedule.interestAmount,
        remainingPrincipal: loan.remainingAmount,
      },
    };
    this.state.receipts.unshift(receipt);

    // Save transaction
    this.state.transactions.unshift({
      transactionId: 1000 + this.state.transactions.length + 1,
      accountNo: fromAccountNo,
      type: 'Payment',
      amount: emiSchedule.emiAmount,
      transDate: timestamp,
      description: `EMI Payment #${emiSchedule.installmentNumber} for Loan #${loanId} (${loan.loanType})`,
      status: 'Success',
      receiptId,
      referenceId: refNumber,
    });

    this.sendNotification(
      cust?.email || 'customer@apexbank.com',
      'SMS',
      `Loan EMI Paid: Installment #${emiSchedule.installmentNumber} of ₹${emiSchedule.emiAmount.toLocaleString()} paid for Loan #${loanId}. Remaining: ₹${loan.remainingAmount.toLocaleString()}`
    );

    this.addUMLTrace({
      diagram: 'Component',
      module: 'Loan',
      source: 'Receipt Service',
      target: 'Loan EMI Receipt',
      message: `EMI Receipt #${receiptId} generated`,
      status: 'completed',
    });

    this.logAudit(
      cust?.customerName || 'Customer',
      'Customer',
      'PAY_EMI',
      'Loan Process',
      `Paid EMI #${emiSchedule.installmentNumber} of ₹${emiSchedule.emiAmount.toLocaleString()} for Loan #${loanId}`,
      'SUCCESS'
    );

    this.saveState();
    return { success: true, receipt };
  }

  // --- NOTIFICATION & AUDIT UTILITIES ---
  public sendNotification(recipient: string, channel: Notification['channel'], message: string): void {
    const notif: Notification = {
      notificationId: 7000 + this.state.notifications.length + 1,
      customerId: this.state.currentUser?.customerId,
      recipient,
      channel,
      message,
      sentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
    };
    this.state.notifications.unshift(notif);
  }

  public markNotificationRead(id: number): void {
    const notif = this.state.notifications.find((n) => n.notificationId === id);
    if (notif) {
      notif.read = true;
      this.saveState();
    }
  }

  public logAudit(
    actor: string,
    role: string,
    action: string,
    module: string,
    details: string,
    status: AuditLog['status'] = 'SUCCESS'
  ): void {
    const log: AuditLog = {
      logId: this.state.auditLogs.length + 1,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor,
      role,
      action,
      module,
      details,
      status,
    };
    this.state.auditLogs.unshift(log);
  }
}

export const bankEngine = new BankEngine();
