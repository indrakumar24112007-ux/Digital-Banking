import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Receipt as ReceiptIcon,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Receipt, Transaction, Account } from '../../types/bank.ts';
import { bankEngine } from '../../services/bankEngine.ts';
import { getLoggedInUserAccounts, getLoggedInUserTransactions } from '../../utils/userAccess.ts';

interface TransactionViewProps {
  onOpenReceipt: (receipt: Receipt) => void;
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  onOpenReceipt,
}) => {
  const state = bankEngine.getState();
  const currentUser = state.currentUser;

  // Strict User Account Isolation: only the logged-in user's accounts are accessible
  const accounts = getLoggedInUserAccounts(state);
  const userAccountNos = new Set(accounts.map((a) => a.accountNo));

  // Only transactions involving the logged-in user's accounts are visible
  const transactions = getLoggedInUserTransactions(state);
  const receipts = state.receipts;

  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [selectedAccountNo, setSelectedAccountNo] = useState<string>(
    accounts[0]?.accountNo || 'ACC1001'
  );
  const [toAccountNo, setToAccountNo] = useState<string>('ACC2001');
  const [amount, setAmount] = useState<number>(5000);
  const [description, setDescription] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchTxn, setSearchTxn] = useState('');

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = bankEngine.deposit(
      selectedAccountNo,
      Number(amount),
      description || 'Branch Counter Cash Deposit'
    );

    if (res.success && res.receipt) {
      setMessage({
        text: `Deposit of ₹${amount.toLocaleString()} successful! New Balance: ₹${res.newBalance?.toLocaleString()}`,
        type: 'success',
      });
      onOpenReceipt(res.receipt);
      setAmount(5000);
      setDescription('');
    } else {
      setMessage({ text: res.error || 'Deposit failed.', type: 'error' });
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = bankEngine.withdraw(
      selectedAccountNo,
      Number(amount),
      description || 'ATM Cash Withdrawal'
    );

    if (res.success && res.receipt) {
      setMessage({
        text: `Withdrawal of ₹${amount.toLocaleString()} successful! New Balance: ₹${res.newBalance?.toLocaleString()}`,
        type: 'success',
      });
      onOpenReceipt(res.receipt);
      setAmount(2000);
      setDescription('');
    } else {
      setMessage({ text: res.error || 'Withdrawal failed.', type: 'error' });
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = bankEngine.fundTransfer(
      selectedAccountNo,
      toAccountNo,
      Number(amount),
      description || 'Inter-Account Fund Transfer'
    );

    if (res.success && res.receipt) {
      setMessage({
        text: `Fund transfer of ₹${amount.toLocaleString()} to ${toAccountNo} completed successfully!`,
        type: 'success',
      });
      onOpenReceipt(res.receipt);
      setAmount(10000);
      setDescription('');
    } else {
      setMessage({ text: res.error || 'Transfer failed.', type: 'error' });
    }
  };

  const currentAcc = accounts.find((a) => a.accountNo === selectedAccountNo);

  const filteredTransactions = transactions.filter((t) => {
    return (
      t.accountNo.toLowerCase().includes(searchTxn.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTxn.toLowerCase()) ||
      t.type.toLowerCase().includes(searchTxn.toLowerCase()) ||
      t.referenceId?.toLowerCase().includes(searchTxn.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">
              Account Transactions & Fund Transfers
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Execute Deposits, Withdrawals, and Fund Transfers with atomic ledger balance updates, instant receipt generation, and SMS/Email notification dispatch.
          </p>
        </div>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Execution Form & Transaction History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          {/* Operation Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveMode('deposit');
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1 ${
                activeMode === 'deposit'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('withdraw');
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1 ${
                activeMode === 'withdraw'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('transfer');
                setMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1 ${
                activeMode === 'transfer'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={
              activeMode === 'deposit'
                ? handleDeposit
                : activeMode === 'withdraw'
                ? handleWithdraw
                : handleTransfer
            }
            className="space-y-4 text-xs"
          >
            {/* Account Selector */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                {activeMode === 'transfer' ? 'From Account (Debit) *' : 'Select Bank Account *'}
              </label>
              <select
                value={selectedAccountNo}
                onChange={(e) => setSelectedAccountNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
              >
                {accounts
                  .filter((a) => a.status === 'Active')
                  .map((acc) => (
                    <option key={acc.accountNo} value={acc.accountNo}>
                      {acc.accountNo} ({acc.accountType}) — Bal: ₹{acc.balance.toLocaleString()}
                    </option>
                  ))}
              </select>

              {currentAcc && (
                <div className="mt-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Available Balance:</span>
                  <span className="font-bold text-slate-900">
                    ₹{currentAcc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Destination Account for Transfers */}
            {activeMode === 'transfer' && (
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  To Destination Account (Credit) *
                </label>
                <select
                  value={toAccountNo}
                  onChange={(e) => setToAccountNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                >
                  {accounts
                    .filter((a) => a.accountNo !== selectedAccountNo && a.status === 'Active')
                    .map((acc) => (
                      <option key={acc.accountNo} value={acc.accountNo}>
                        {acc.accountNo} ({acc.accountType})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Amount (₹) *</label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-base font-extrabold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Description / Narration
              </label>
              <input
                type="text"
                placeholder={
                  activeMode === 'deposit'
                    ? 'e.g. Branch counter cash deposit'
                    : activeMode === 'withdraw'
                    ? 'e.g. ATM withdrawal'
                    : 'e.g. Rent payment or family support'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
              />
            </div>

            {/* Transaction Security & Validation Info Box */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
              <span className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Transaction Security & Validation Rules</span>
              </span>
              <p className="text-blue-800">
                {activeMode === 'deposit' &&
                  'Core ledger: updateBalance(+amount) -> saveTransactionRecord() -> instant receipt generation.'}
                {activeMode === 'withdraw' &&
                  'Validation check: [balance >= amount]. If current account, verifies overdraft limit. Else logs withdrawal error.'}
                {activeMode === 'transfer' &&
                  'Dual account atomic sync: fromAccount debited, toAccount credited, sends instant notifications.'}
              </p>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5 ${
                activeMode === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : activeMode === 'withdraw'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <span>
                Execute {activeMode === 'deposit' ? 'Deposit' : activeMode === 'withdraw' ? 'Withdrawal' : 'Transfer'}
              </span>
            </button>
          </form>
        </div>

        {/* Transaction History & Receipt Access */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Transaction Ledger & Receipts</h3>
              <p className="text-xs text-slate-500">
                Core Banking Transaction Database (Total: {transactions.length} records)
              </p>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTxn}
                onChange={(e) => setSearchTxn(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredTransactions.map((t) => {
              const receipt = receipts.find((r) => r.receiptId === t.receiptId);
              return (
                <div
                  key={t.transactionId}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition flex items-center justify-between gap-3"
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
                      {t.type === 'Deposit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : t.type === 'Withdraw' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{t.type}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                          {t.accountNo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{t.transactionId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{t.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{t.transDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold font-mono ${
                          t.type === 'Deposit' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {t.type === 'Deposit' ? '+' : '-'}₹
                        {t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-medium">SUCCESS</span>
                    </div>

                    {receipt && (
                      <button
                        onClick={() => onOpenReceipt(receipt)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-400 text-slate-700 rounded-lg text-xs font-medium transition shadow-2xs"
                        title="Display Receipt"
                      >
                        <ReceiptIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
