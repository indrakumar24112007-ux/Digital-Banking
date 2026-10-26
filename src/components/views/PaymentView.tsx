import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  Smartphone,
  FileCheck2,
  Receipt as ReceiptIcon,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Send,
} from 'lucide-react';
import { PaymentType, PaymentMode, Receipt } from '../../types/bank.ts';
import { bankEngine } from '../../services/bankEngine.ts';
import { getLoggedInUserAccounts, getLoggedInUserPayments } from '../../utils/userAccess.ts';

interface PaymentViewProps {
  onOpenReceipt: (receipt: Receipt) => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  onOpenReceipt,
}) => {
  const state = bankEngine.getState();
  const currentUser = state.currentUser;

  // Strict User Account Isolation: only the logged-in user's accounts are accessible
  const accounts = getLoggedInUserAccounts(state);
  const payments = getLoggedInUserPayments(state);

  const [paymentType, setPaymentType] = useState<PaymentType>('Bill Payment');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [fromAccountNo, setFromAccountNo] = useState<string>(
    accounts[0]?.accountNo || 'ACC1001'
  );
  const [amount, setAmount] = useState<number>(1250);
  const [payeeDetails, setPayeeDetails] = useState<string>('BESCOM Electricity Bangalore (ID: 88129)');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const paymentTypeOptions: { type: PaymentType; label: string; icon: any; defaultPayee: string; defaultAmt: number }[] = [
    {
      type: 'Bill Payment',
      label: 'Pay Utility Bills',
      icon: Zap,
      defaultPayee: 'BESCOM Electricity Bangalore (ID: 88129)',
      defaultAmt: 1450,
    },
    {
      type: 'Recharge Mobile',
      label: 'Mobile Recharge',
      icon: Smartphone,
      defaultPayee: 'Jio 5G Unlimited (+91 9876543210)',
      defaultAmt: 749,
    },
    {
      type: 'Credit Card Payment',
      label: 'Credit Card Bill',
      icon: CreditCard,
      defaultPayee: 'Apex Titanium Card (XXXX-4421)',
      defaultAmt: 8500,
    },
    {
      type: 'Loan EMI Payment',
      label: 'Loan EMI Payment',
      icon: FileCheck2,
      defaultPayee: 'Apex Home Loan #7001 (Installment #3)',
      defaultAmt: 7891.88,
    },
  ];

  const handleTypeSelect = (opt: typeof paymentTypeOptions[0]) => {
    setPaymentType(opt.type);
    setPayeeDetails(opt.defaultPayee);
    setAmount(opt.defaultAmt);
    setMessage(null);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = bankEngine.makePayment({
      fromAccountNo,
      paymentType,
      paymentMode,
      amount: Number(amount),
      payeeDetails,
    });

    if (res.success && res.receipt) {
      setMessage({
        text: `Payment of ₹${amount.toLocaleString()} for ${payeeDetails} via ${paymentMode} successful!`,
        type: 'success',
      });
      onOpenReceipt(res.receipt);
    } else {
      setMessage({ text: res.error || 'Payment failed.', type: 'error' });
    }
  };

  const selectedAcc = accounts.find((a) => a.accountNo === fromAccountNo);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">
              Bill Payments & Digital Recharges
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bill payments, Mobile Recharge, Credit Card settlements, and Loan EMI payments via specialized UPI, Card, and Net Banking Processors.
          </p>
        </div>
      </div>

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

      {/* Payment Type Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {paymentTypeOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = paymentType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => handleTypeSelect(opt)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-xl w-fit ${
                  isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{opt.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {opt.type === 'Bill Payment' ? 'Utility / Gas / Water' : opt.type}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Payment Execution Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Payment Initiation</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
              {paymentType}
            </span>
          </h3>

          <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
            {/* Payment Processor Selector */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Payment Processor Gateway *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'Card', 'Net Banking'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-2 rounded-xl border text-center font-bold text-xs transition ${
                      paymentMode === mode
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                {paymentMode === 'UPI' && 'UPI Processor: Single transaction cap ₹1,00,000'}
                {paymentMode === 'Card' && 'Card Processor: Visa/Mastercard 3D-Secure 2.0'}
                {paymentMode === 'Net Banking' && 'Net Banking Processor: Core Clearing Direct Debit'}
              </p>
            </div>

            {/* From Account */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">From Account *</label>
              <select
                value={fromAccountNo}
                onChange={(e) => setFromAccountNo(e.target.value)}
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

              {selectedAcc && (
                <div className="mt-1 text-[11px] text-slate-500">
                  Current Balance: <span className="font-bold text-slate-900">₹{selectedAcc.balance.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Payee / Biller Details */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Biller / Payee Identification *
              </label>
              <input
                type="text"
                required
                value={payeeDetails}
                onChange={(e) => setPayeeDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-base font-extrabold"
              />
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-[11px] text-purple-900 space-y-1">
              <span className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Payment State Machine & Security</span>
              </span>
              <p className="text-purple-800">
                Payment verified through Payment Gateway. Generates formal Payment Receipt & triggers SMS/Email notification.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Authorize Payment</span>
            </button>
          </form>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Payment Gateway Records</h3>
            <span className="text-xs font-mono text-purple-600 font-semibold bg-purple-50 px-2.5 py-1 rounded-md">
              Total Payments: {payments.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {payments.map((p) => {
              const receipt = state.receipts.find((r) => r.receiptId === p.receiptId);
              return (
                <div
                  key={p.paymentId}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{p.paymentType}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-mono font-semibold">
                        {p.paymentMode} Processor
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">#{p.paymentId}</span>
                    </div>
                    <p className="text-xs text-slate-700">{p.payeeDetails}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Account: {p.accountNo} • {p.paymentDate}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-slate-900">
                        ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase">
                        {p.status}
                      </span>
                    </div>

                    {receipt && (
                      <button
                        onClick={() => onOpenReceipt(receipt)}
                        className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-purple-50 hover:text-purple-600 text-slate-700 transition shadow-2xs"
                        title="View Payment Receipt"
                      >
                        <ReceiptIcon className="w-4 h-4" />
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
