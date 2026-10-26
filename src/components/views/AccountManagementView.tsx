import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  PiggyBank,
  Building,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  FileText,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  Copy,
  Check,
  X,
  CreditCard,
  UserCheck,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Account, AccountType } from '../../types/bank.ts';
import { bankEngine } from '../../services/bankEngine.ts';
import { getLoggedInUserAccounts, getLoggedInUserCustomers } from '../../utils/userAccess.ts';
import { Rupee } from '../Rupee.tsx';

interface AccountManagementViewProps {
  onGoHome?: () => void;
}

export const AccountManagementView: React.FC<AccountManagementViewProps> = ({ onGoHome }) => {
  const state = bankEngine.getState();
  const currentUser = state.currentUser;

  // Strict User Account Isolation: only the logged-in user's account is accessed and visible
  const accounts = getLoggedInUserAccounts(state);
  const customers = getLoggedInUserCustomers(state);

  // View state: 'overview' vs 'manageDetail' (Account Detail Page)
  const [activeViewMode, setActiveViewMode] = useState<'manageDetail' | 'overview'>('manageDetail');
  
  // Category option in Account Detail Page: 'Savings' vs 'Current'
  const [selectedCategory, setSelectedCategory] = useState<'Savings' | 'Current'>('Savings');

  // Selected account for detailed inspection (1-6 fields)
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<Account | null>(null);

  // Account deletion confirmation state
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Modals & alerts
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    currentUser?.customerId || (customers[0]?.customerId || 101)
  );
  const [openAccountType, setOpenAccountType] = useState<AccountType>('Savings');
  const [initialDeposit, setInitialDeposit] = useState<number>(5000);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [statementAccount, setStatementAccount] = useState<Account | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Filter accounts by category
  const savingAccounts = accounts.filter((a) => a.accountType === 'Savings');
  const currentAccounts = accounts.filter((a) => a.accountType === 'Current');

  const displayedAccounts = selectedCategory === 'Savings' ? savingAccounts : currentAccounts;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const targetCustId = currentUser?.customerId || selectedCustomerId;
    const res = bankEngine.openAccount(targetCustId, openAccountType, Number(initialDeposit));
    if (res.success && res.account) {
      setMessage({
        text: `Account #${res.account.accountNo} (${openAccountType}) opened successfully with initial deposit of ₹${initialDeposit.toLocaleString()}!`,
        type: 'success',
      });
      setShowOpenModal(false);
      setInitialDeposit(5000);
      // Auto select the new category
      if (openAccountType === 'Savings' || openAccountType === 'Current') {
        setSelectedCategory(openAccountType);
        setSelectedDetailAccount(res.account);
      }
    } else {
      setMessage({ text: res.error || 'Failed to open account', type: 'error' });
    }
  };

  const handleDeleteAccount = (accountNo: string) => {
    setMessage(null);
    const res = bankEngine.deleteAccount(accountNo);
    if (res.success) {
      setMessage({
        text: `Account ${accountNo} has been deleted successfully from your profile.`,
        type: 'success',
      });
      setAccountToDelete(null);
      if (selectedDetailAccount?.accountNo === accountNo) {
        setSelectedDetailAccount(null);
      }
    } else {
      setMessage({ text: res.error || 'Failed to delete account', type: 'error' });
    }
  };

  const handleApplyInterest = (accountNo: string) => {
    setMessage(null);
    const res = bankEngine.applyMonthlySavingsInterest(accountNo);
    if (res.success) {
      setMessage({
        text: `Successfully calculated and credited monthly interest of ₹${res.interestAdded?.toFixed(2)} to account ${accountNo}.`,
        type: 'success',
      });
    } else {
      setMessage({ text: res.error || 'Failed to apply interest', type: 'error' });
    }
  };

  // Helper to get CIF Number
  const getCIFNumber = (acc: Account): string => {
    return `CIF-${String(acc.customerId || currentUser?.customerId || 101).padStart(6, '0')}`;
  };

  // Helper to get Account Name
  const getAccountName = (acc: Account): string => {
    const owner = customers.find((c) => c.customerId === acc.customerId);
    return owner?.customerName || currentUser?.name || 'Account Holder';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner with Go Back UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Account Management
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider font-mono">
              Core Banking
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your registered accounts, view CIF records, inspect balances, and configure settings.
          </p>
        </div>

        {/* Top Right Corner Controls: Go Back UI & Open New Account */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {onGoHome && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoHome}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
              title="Return to Home Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Go to Home</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowOpenModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open New Account</span>
          </motion.button>
        </div>
      </div>

      {/* Alert Message Banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-slate-400 hover:text-slate-700 p-1 font-bold text-sm"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Account UI: Primary interactive banner moving to Account Detail Page */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-white/10 rounded-xl text-blue-300">
                <Wallet className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Account Hub & Control Center
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Manage Account & Inspect CIF Details
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Explore your registered Saving Accounts and Current Accounts. Inspect CIF numbers, balances, account holder details, interest yields, or delete inactive accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveViewMode('manageDetail')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-sm ${
                activeViewMode === 'manageDetail'
                  ? 'bg-white text-blue-950 font-black shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Manage Account UI (Detail Page)</span>
            </button>

            <button
              onClick={() => setActiveViewMode('overview')}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center space-x-2 ${
                activeViewMode === 'overview'
                  ? 'bg-white text-blue-950 font-black shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>All Accounts Overview</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ACCOUNT DETAIL PAGE (The User Requested Detail Experience) */}
      {/* ======================================================== */}
      {activeViewMode === 'manageDetail' && (
        <div className="space-y-6">
          {/* Detail Page Control Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Account Detail Page
                </h3>
                <p className="text-xs text-slate-500">
                  Select an account category below to display registered accounts and view detailed CIF records.
                </p>
              </div>

              {/* Top Right Corner Go Back UI to Home */}
              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition self-start sm:self-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Go to Home</span>
                </button>
              )}
            </div>

            {/* TWO OPTIONS: Saving Account & Current Account */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Choose Account Category
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Saving Account */}
                <button
                  onClick={() => {
                    setSelectedCategory('Savings');
                    setSelectedDetailAccount(null);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedCategory === 'Savings'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`p-3 rounded-2xl ${
                        selectedCategory === 'Savings'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <PiggyBank className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          Saving Account
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedCategory === 'Savings'
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {savingAccounts.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        High yield 4.0% p.a. • Instant transfers & interest accrual
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      selectedCategory === 'Savings'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {selectedCategory === 'Savings' ? 'Active' : 'Select'}
                  </span>
                </button>

                {/* Option 2: Current Account */}
                <button
                  onClick={() => {
                    setSelectedCategory('Current');
                    setSelectedDetailAccount(null);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedCategory === 'Current'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`p-3 rounded-2xl ${
                        selectedCategory === 'Current'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          Current Account
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedCategory === 'Current'
                              ? 'bg-blue-200 text-blue-900'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {currentAccounts.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Commercial operations • Overdraft facility up to ₹2,00,000
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      selectedCategory === 'Current'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {selectedCategory === 'Current' ? 'Active' : 'Select'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Registered Accounts List for Selected Category */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                Registered {selectedCategory} Accounts ({displayedAccounts.length})
              </h4>
              <span className="text-xs text-slate-400">
                Click any account card to view the 6 mandatory details
              </span>
            </div>

            {/* Condition: if no account is found in Saving/Current account display No Account Found */}
            {displayedAccounts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 sm:p-14 text-center space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                  {selectedCategory === 'Savings' ? (
                    <PiggyBank className="w-7 h-7" />
                  ) : (
                    <Building className="w-7 h-7" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Account Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No registered {selectedCategory} Account was found for your profile. You can open a new {selectedCategory.toLowerCase()} account instantly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setOpenAccountType(selectedCategory);
                      setShowOpenModal(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Open {selectedCategory} Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedAccounts.map((acc) => {
                  const accountName = getAccountName(acc);
                  const cifNo = getCIFNumber(acc);
                  const isSelected = selectedDetailAccount?.accountNo === acc.accountNo;

                  return (
                    <motion.div
                      key={acc.accountNo}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedDetailAccount(acc)}
                      className={`cursor-pointer rounded-2xl p-5 border transition flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              #{acc.accountId} • {cifNo}
                            </span>
                            <h5 className="text-base font-bold font-mono text-slate-900 mt-0.5">
                              {acc.accountNo}
                            </h5>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5">
                              {accountName}
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              acc.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Current Balance
                          </span>
                          <div className="text-xl font-extrabold text-slate-900 mt-0.5 flex items-center">
                            <Rupee className="w-4 h-4 text-slate-900 mr-0.5" />
                            <span>
                              {acc.balance.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-blue-600 font-bold flex items-center space-x-1">
                          <span>View Details</span>
                          <span className="text-base leading-none">&rarr;</span>
                        </span>

                        {/* Account Deletion Quick Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAccountToDelete(acc);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* DETAILED ACCOUNT MODAL / DRAWER (THE 6 MANDATORY FIELDS) */}
          {/* ======================================================== */}
          <AnimatePresence>
            {selectedDetailAccount && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95"
                >
                  {/* Top Bar with 'X' Mark UI to Exit */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                        Official Bank Account Record
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        Account Details
                      </h3>
                    </div>

                    {/* At the top 'X' mark UI to exit from viewing Account details */}
                    <button
                      onClick={() => setSelectedDetailAccount(null)}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                      aria-label="Exit Account details"
                      title="Close Account Details (Exit)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* The 6 Mandatory Details in Structured Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Account Type */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        1. Account Type
                      </span>
                      <div className="flex items-center space-x-2 pt-0.5">
                        {selectedDetailAccount.accountType === 'Savings' ? (
                          <PiggyBank className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Building className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="font-bold text-slate-900 text-sm">
                          {selectedDetailAccount.accountType} Account
                        </span>
                      </div>
                    </div>

                    {/* 2. Account Number */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        2. Account Number
                      </span>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="font-mono font-black text-slate-900 text-sm tracking-wide">
                          {selectedDetailAccount.accountNo}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(selectedDetailAccount.accountNo, 'accNo')
                          }
                          className="text-xs text-blue-600 hover:text-blue-800 p-1 flex items-center space-x-1"
                          title="Copy Account Number"
                        >
                          {copiedField === 'accNo' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 3. Account Name */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        3. Account Name
                      </span>
                      <p className="font-bold text-slate-900 text-sm pt-0.5">
                        {getAccountName(selectedDetailAccount)}
                      </p>
                    </div>

                    {/* 4. Account Status */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        4. Account Status
                      </span>
                      <div className="flex items-center space-x-2 pt-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            selectedDetailAccount.status === 'Active'
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        <span
                          className={`font-bold text-xs px-2 py-0.5 rounded-md ${
                            selectedDetailAccount.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {selectedDetailAccount.status}
                        </span>
                      </div>
                    </div>

                    {/* 5. Primary CIF Number */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                          5. Primary CIF Number (Customer Info File)
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(getCIFNumber(selectedDetailAccount), 'cif')
                          }
                          className="text-xs text-blue-700 hover:text-blue-900 p-1 flex items-center space-x-1"
                          title="Copy CIF Number"
                        >
                          {copiedField === 'cif' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="font-mono font-black text-blue-950 text-base">
                        {getCIFNumber(selectedDetailAccount)}
                      </p>
                      <p className="text-[10px] text-blue-600">
                        Primary master customer profile reference for KYC & multi-account linkage.
                      </p>
                    </div>

                    {/* 6. Current Balance */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1 sm:col-span-2">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        6. Current Balance
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center">
                        <Rupee className="w-6 h-6 text-slate-900 mr-1" />
                        <span>
                          {selectedDetailAccount.balance.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {selectedDetailAccount.accountType === 'Savings' && (
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Accruing annual interest rate: {selectedDetailAccount.interestRate}% p.a.
                        </p>
                      )}
                      {selectedDetailAccount.accountType === 'Current' && (
                        <p className="text-[11px] text-blue-700 font-semibold">
                          Overdraft limit: ₹{selectedDetailAccount.overdraftLimit.toLocaleString()} (Total available: ₹{(selectedDetailAccount.balance + selectedDetailAccount.overdraftLimit).toLocaleString()})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Account Deletion Option */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setStatementAccount(selectedDetailAccount);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Statement</span>
                      </button>

                      {selectedDetailAccount.accountType === 'Savings' &&
                        selectedDetailAccount.status === 'Active' && (
                          <button
                            onClick={() =>
                              handleApplyInterest(selectedDetailAccount.accountNo)
                            }
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>Credit Interest</span>
                          </button>
                        )}
                    </div>

                    {/* 2. Add Account Deletion Option */}
                    <button
                      onClick={() => setAccountToDelete(selectedDetailAccount)}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. OVERVIEW MODE: ALL ACCOUNTS LIST (Optional secondary tab) */}
      {/* ======================================================== */}
      {activeViewMode === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              All Registered Accounts ({accounts.length})
            </h3>
            <button
              onClick={() => setActiveViewMode('manageDetail')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold"
            >
              Switch to Manage Account Detail Page &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc) => {
              const accountName = getAccountName(acc);
              const cifNo = getCIFNumber(acc);
              const isClosed = acc.status === 'Closed';

              return (
                <div
                  key={acc.accountNo}
                  className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition ${
                    isClosed
                      ? 'border-slate-200 opacity-60 bg-slate-50'
                      : acc.accountType === 'Current'
                      ? 'border-blue-200 hover:border-blue-400'
                      : 'border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          #{acc.accountId} • {cifNo}
                        </span>
                        <h4 className="text-base font-bold font-mono text-slate-900 mt-0.5">
                          {acc.accountNo}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          Holder: <span className="font-bold text-slate-900">{accountName}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          acc.accountType === 'Savings'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {acc.accountType}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Ledger Balance
                      </span>
                      <div className="text-xl font-black text-slate-900 mt-0.5 flex items-center">
                        <Rupee className="w-4 h-4 text-slate-900 mr-0.5" />
                        <span>
                          {acc.balance.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedCategory(
                          acc.accountType === 'Savings' ? 'Savings' : 'Current'
                        );
                        setSelectedDetailAccount(acc);
                        setActiveViewMode('manageDetail');
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      Manage & View CIF &rarr;
                    </button>

                    <button
                      onClick={() => setAccountToDelete(acc)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ACCOUNT DELETION CONFIRMATION MODAL (Requirement 2) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Account {accountToDelete.accountNo}?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete this {accountToDelete.accountType} account? This action is permanent and will remove the account record from your digital banking ledger.
                </p>
                {accountToDelete.balance > 0 && (
                  <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                    Note: Account has an existing balance of ₹{accountToDelete.balance.toLocaleString()}. Proceeding will remove this account.
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setAccountToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAccount(accountToDelete.accountNo)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Yes, Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* OPEN ACCOUNT MODAL */}
      {/* ======================================================== */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Open New Bank Account</h3>
                <p className="text-xs text-slate-500">
                  Instant digital account creation with immediate ledger activation
                </p>
              </div>
              <button
                onClick={() => setShowOpenModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Account Holder</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || customers[0]?.customerName || 'Account Holder'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Account Type *</label>
                <select
                  value={openAccountType}
                  onChange={(e) => setOpenAccountType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Savings">Savings Account (4.0% p.a. interest)</option>
                  <option value="Current">Current Account (Overdraft Facility)</option>
                  <option value="Fixed">Fixed Deposit Account (7.2% p.a.)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Initial Deposit Amount (₹) *
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum initial deposit: ₹500</p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Open & Activate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATEMENT MODAL */}
      {/* ======================================================== */}
      {statementAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Account Statement: {statementAccount.accountNo}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Official Account Statement & Ledger Activity
                </p>
              </div>
              <button
                onClick={() => setStatementAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Statement Summary */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400">Account Type</span>
                <p className="font-bold text-slate-900">{statementAccount.accountType}</p>
              </div>
              <div>
                <span className="text-slate-400">CIF Number</span>
                <p className="font-bold text-blue-700 font-mono">
                  {getCIFNumber(statementAccount)}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Available Balance</span>
                <p className="font-extrabold text-slate-900">
                  ₹{statementAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="text-center py-6 text-slate-400 text-xs">
              Statement generated as on {new Date().toLocaleDateString()}. All transactions verified.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStatementAccount(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
