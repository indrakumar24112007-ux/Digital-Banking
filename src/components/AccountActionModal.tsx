import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Wallet,
  X,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { bankEngine } from '../services/bankEngine.ts';
import { Receipt } from '../types/bank.ts';
import { Rupee } from './Rupee.tsx';

interface AccountActionModalProps {
  type: 'scanPay' | 'viewBalance' | null;
  onClose: () => void;
  onOpenReceipt?: (receipt: Receipt) => void;
}

export const AccountActionModal: React.FC<AccountActionModalProps> = ({
  type,
  onClose,
  onOpenReceipt,
}) => {
  const state = bankEngine.getState();
  const defaultAcc = state.currentUser?.accountNo || 'ACC1001';

  const [accountNo, setAccountNo] = useState(defaultAcc);
  const [pinOrPass, setPinOrPass] = useState('');
  const [payeeUpi, setPayeeUpi] = useState('merchant@upi');
  const [payAmount, setPayAmount] = useState<number>(500);
  const [revealedBalance, setRevealedBalance] = useState<{
    accountNo: string;
    accountType: string;
    balance: number;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!type) return null;

  const handleCheckBalance = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const acc = bankEngine.getAccountByNo(accountNo);
    if (!acc) {
      setError('account not found kindly make sure You have register before login');
      return;
    }

    if (state.currentUser?.accountNo && acc.accountNo.toUpperCase() !== state.currentUser.accountNo.toUpperCase()) {
      setError(`Access restricted: You can only access your own logged-in account (${state.currentUser.accountNo}).`);
      return;
    }

    setRevealedBalance({
      accountNo: acc.accountNo,
      accountType: acc.accountType,
      balance: acc.balance,
      status: acc.status,
    });
  };

  const handleScanPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const acc = bankEngine.getAccountByNo(accountNo);
    if (!acc) {
      setError('account not found kindly make sure You have register before login');
      return;
    }

    if (state.currentUser?.accountNo && acc.accountNo.toUpperCase() !== state.currentUser.accountNo.toUpperCase()) {
      setError(`Access restricted: You can only access your own logged-in account (${state.currentUser.accountNo}).`);
      return;
    }

    if (payAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    const res = bankEngine.makePayment({
      fromAccountNo: acc.accountNo,
      paymentType: 'Bill Payment',
      paymentMode: 'UPI',
      amount: Number(payAmount),
      payeeDetails: `QR / Scan & Pay to ${payeeUpi}`,
    });

    if (res.success && res.receipt) {
      setSuccessMsg(`Paid ₹${payAmount.toLocaleString()} to ${payeeUpi} successfully!`);
      if (onOpenReceipt) {
        onOpenReceipt(res.receipt);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(res.error || 'Payment failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2 rounded-xl ${
                type === 'scanPay'
                  ? 'bg-purple-50 text-purple-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {type === 'scanPay' ? <QrCode className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {type === 'scanPay' ? 'Scan & Pay' : 'View Account Balance'}
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'scanPay'
                  ? 'Enter account number to authorize UPI scan payment'
                  : 'Enter account number to fetch live ledger balance'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            {successMsg}
          </div>
        )}

        {/* VIEW BALANCE FLOW (Requirement 15) */}
        {type === 'viewBalance' && (
          <div className="space-y-4">
            {!revealedBalance ? (
              <form onSubmit={handleCheckBalance} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Enter Your Account Number *
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ACC1001"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Available in database: ACC1001, ACC1002, ACC2001, etc.
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Fetch Balance</span>
                </motion.button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2 animate-in fade-in">
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold">
                    Available Balance ({revealedBalance.accountType})
                  </span>
                  <div className="text-3xl font-extrabold text-emerald-950 flex items-center justify-center">
                    <Rupee className="w-7 h-7 text-emerald-800 mr-1" />
                    <span>
                      {revealedBalance.balance.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Account: {revealedBalance.accountNo} • Status: {revealedBalance.status}
                  </p>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setRevealedBalance(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Check Another Account
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    Done
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCAN & PAY FLOW (Requirement 15) */}
        {type === 'scanPay' && (
          <form onSubmit={handleScanPaySubmit} className="space-y-3.5 text-xs">
            {/* Visual Scan simulation QR */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
              <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
                  QR Merchant Scanner Active
                </span>
                <p className="font-bold text-slate-800 mt-1 text-xs">Merchant: Apex Retail & Utilities</p>
                <p className="text-[11px] text-slate-400 font-mono">UPI ID: merchant@apexbank</p>
              </div>
            </div>

            {/* Direct prompt: Enter your account number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Enter Your Account Number (Debit From) *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ACC1001"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount in Rupees (₹) *</label>
              <input
                type="number"
                min={1}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Authorize & Pay Instant UPI</span>
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
