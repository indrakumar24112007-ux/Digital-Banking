import React from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  CreditCard,
  FileCheck2,
  Users,
  ShieldCheck,
  Building,
  TrendingUp,
  Receipt as ReceiptIcon,
  Layers,
  Sparkles,
  QrCode,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { bankEngine } from '../../services/bankEngine.ts';
import { Receipt } from '../../types/bank.ts';
import { Rupee } from '../Rupee.tsx';
import {
  getLoggedInUserAccounts,
  getLoggedInUserTransactions,
  getLoggedInUserLoans,
} from '../../utils/userAccess.ts';

interface DashboardViewProps {
  onSelectTab: (tab: string) => void;
  onOpenReceipt: (receipt: Receipt) => void;
  onOpenAIAdvisor: () => void;
  onOpenScanPay: () => void;
  onOpenViewBalance: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenReceipt,
  onOpenAIAdvisor,
  onOpenScanPay,
  onOpenViewBalance,
}) => {
  const state = bankEngine.getState();
  const currentUser = state.currentUser;

  // Strict User Account Isolation: only the logged-in user's account is accessed and visible
  const userAccounts = getLoggedInUserAccounts(state);
  const userAccountNos = new Set(userAccounts.map((a) => a.accountNo));
  const userTotalBal = userAccounts.reduce(
    (acc, a) => acc + (a.status === 'Active' ? a.balance : 0),
    0
  );

  // User-specific loans
  const userLoans = getLoggedInUserLoans(state);
  const totalLoans = userLoans.reduce(
    (acc, l) => acc + (l.status === 'Active' ? l.remainingAmount : 0),
    0
  );

  // User-specific transactions
  const userTransactions = getLoggedInUserTransactions(state);
  const recentTransactions = userTransactions.slice(0, 6);

  const activeAccountsCount = userAccounts.filter((a) => a.status === 'Active').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Welcome Banner - White Modern Card with subtle gradient highlight */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            {/* Hi Account Name - Big Font Italic with Wave Emoji (Focus Mode Tagged Element) */}
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tight text-slate-900 flex flex-wrap items-center gap-3">
              <span>Hi {currentUser?.name || 'Customer'}, 👋</span>
              {currentUser?.accountNo && (
                <span className="not-italic font-mono text-xs sm:text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 font-bold self-center">
                  {currentUser.accountNo}
                </span>
              )}
            </div>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Welcome back to your Digital Banking portal. Access your accounts, balances, instant fund transfers, deposits, bills, and reducing-balance loans.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenScanPay}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan & Pay</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenViewBalance}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Wallet className="w-4 h-4" />
                <span>View Balance</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAIAdvisor}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Risk Advisor</span>
              </motion.button>
            </div>
          </div>

          {/* Quick Balance Snapshot Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg w-full md:w-80 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">
                Primary Account
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono font-bold">
                {currentUser?.accountNo || 'ACC1001'}
              </span>
            </div>
            <div>
              <span className="text-xs text-blue-300">Available Balance</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center mt-0.5">
                <Rupee className="w-6 h-6 text-white mr-1" />
                <span>
                  {(userAccounts[0]?.balance ?? userTotalBal).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
              <button
                onClick={onOpenViewBalance}
                className="text-blue-200 hover:text-white font-semibold flex items-center space-x-1"
              >
                <span>Check Another Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentUser?.role === 'Customer' ? 'My Net Liquidity' : 'Total Bank Deposits'}
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center">
              <Rupee className="w-5 h-5 text-slate-900 mr-1" />
              <span>
                {userTotalBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Savings & Current</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              My Active Loans
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center">
              <Rupee className="w-5 h-5 text-slate-900 mr-1" />
              <span>{totalLoans.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              {userLoans.filter((l) => l.status === 'Active').length} active loan{userLoans.filter((l) => l.status === 'Active').length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              My Accounts
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {activeAccountsCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {activeAccountsCount} Active Account{activeAccountsCount === 1 ? '' : 's'}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              My Transactions
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {userTransactions.length}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {userTransactions.length} Transaction Records
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Quick Action Navigation Grid (including Scan & Pay and View Balance) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Direct Actions & Banking Services</h2>
            <p className="text-xs text-slate-500">
              One-click operations for instant transactions, scans, payments, and account services
            </p>
          </div>
          <span className="text-xs font-mono text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-md">
            Digital Banking Core
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Scan & Pay (Req 15) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenScanPay}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-110 transition">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Scan & Pay</span>
            <span className="text-[10px] text-slate-400 font-mono">Instant UPI</span>
          </motion.button>

          {/* View Balance (Req 15) */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenViewBalance}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">View Balance</span>
            <span className="text-[10px] text-slate-400 font-mono">Check Ledger</span>
          </motion.button>

          {/* Deposit */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab('transaction')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-110 transition">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Deposit</span>
            <span className="text-[10px] text-slate-400 font-mono">+ Credit</span>
          </motion.button>

          {/* Withdraw */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab('transaction')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl group-hover:scale-110 transition">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Withdraw</span>
            <span className="text-[10px] text-slate-400 font-mono">- Debit</span>
          </motion.button>

          {/* Fund Transfer */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab('transaction')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl group-hover:scale-110 transition">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Transfer</span>
            <span className="text-[10px] text-slate-400 font-mono">Dual Sync</span>
          </motion.button>

          {/* Payments & Bills */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab('payment')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl group-hover:scale-110 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Pay Bills</span>
            <span className="text-[10px] text-slate-400 font-mono">Utilities/Cards</span>
          </motion.button>

          {/* Loans & EMI */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab('loan')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-110 transition">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Loans & EMI</span>
            <span className="text-[10px] text-slate-400 font-mono">Sanction</span>
          </motion.button>

          {/* Customer KYC */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab('customer')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition text-center flex flex-col items-center space-y-2 group"
          >
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">KYC Portal</span>
            <span className="text-[10px] text-slate-400 font-mono">Profiles</span>
          </motion.button>
        </div>
      </div>

      {/* Two Columns: Active Accounts & Recent Transactions with Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span>My Bank Account ({currentUser?.name || 'Account Holder'})</span>
            </h2>
            <button
              onClick={() => onSelectTab('account')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold"
            >
              Manage &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {userAccounts.map((acc) => (
              <motion.div
                key={acc.accountNo}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{acc.accountNo}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        acc.accountType === 'Savings'
                          ? 'bg-emerald-100 text-emerald-800'
                          : acc.accountType === 'Current'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {acc.accountType}
                    </span>
                    <span className="text-[10px] text-slate-400">#{acc.accountId}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {acc.accountType === 'Savings' && `Interest: ${acc.interestRate}% p.a.`}
                    {acc.accountType === 'Current' &&
                      `Overdraft Facility: ₹${acc.overdraftLimit.toLocaleString()}`}
                    {acc.accountType === 'Fixed' &&
                      `Tenure: ${acc.tenureMonths}m • Maturing: ${acc.maturityDate}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">Balance</p>
                  <p className="text-base font-bold text-slate-900 flex items-center justify-end">
                    <Rupee className="w-4 h-4 text-slate-800 mr-0.5" />
                    <span>{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Transactions & Receipts Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ReceiptIcon className="w-5 h-5 text-indigo-600" />
              <span>Recent Transactions & Receipts</span>
            </h2>
            <button
              onClick={() => onSelectTab('transaction')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold"
            >
              All Transactions &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.map((t) => {
              const receipt = state.receipts.find((r) => r.receiptId === t.receiptId);
              return (
                <motion.div
                  key={t.transactionId}
                  whileHover={{ scale: 1.01 }}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2.5 rounded-xl text-xs font-bold ${
                        t.type === 'Deposit'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.type === 'Withdraw'
                          ? 'bg-rose-100 text-rose-800'
                          : t.type === 'Transfer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {t.type === 'Deposit' ? '+' : '-'}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{t.description}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {t.accountNo} • {t.transDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold flex items-center justify-end ${
                          t.type === 'Deposit' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        <span className="mr-0.5">{t.type === 'Deposit' ? '+' : '-'}</span>
                        <Rupee className="w-3.5 h-3.5" />
                        <span>{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </p>
                    </div>

                    {receipt && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onOpenReceipt(receipt)}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition shadow-2xs"
                        title="View Receipt"
                      >
                        <ReceiptIcon className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
