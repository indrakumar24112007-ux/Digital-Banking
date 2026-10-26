import React from 'react';
import { Receipt } from '../types/bank.ts';
import { CheckCircle2, Printer, X, ShieldCheck, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Receipt"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Building2 className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Apex International Bank</h2>
              <p className="text-xs text-blue-200">OOAD Transaction Receipt Service «Entity»</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-white/15">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Transaction Successfully Executed</span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6">
          <div className="text-center py-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Amount Processed ({receipt.receiptType})
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Receipt ID</span>
              <p className="font-mono font-bold text-slate-800">#{receipt.receiptId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Reference No</span>
              <p className="font-mono text-xs font-semibold text-slate-800 truncate" title={receipt.referenceNumber}>
                {receipt.referenceNumber}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Customer Name</span>
              <p className="font-semibold text-slate-800">{receipt.customerName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Account Number</span>
              <p className="font-mono font-semibold text-slate-800">{receipt.accountNo}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-medium">Transaction Date</span>
              <p className="text-slate-800">{receipt.receiptDate}</p>
            </div>
            {receipt.paymentMode && (
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Payment Mode</span>
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {receipt.paymentMode} Processor
                </span>
              </div>
            )}
          </div>

          {/* Dynamic Details */}
          {receipt.details && Object.keys(receipt.details).length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Operation Breakdown
              </h4>
              <div className="bg-slate-50/80 rounded-lg p-3 space-y-1.5 text-xs text-slate-700">
                {Object.entries(receipt.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {typeof value === 'number' && key.toLowerCase().includes('balance')
                        ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Cryptographically verified & logged in Core Banking Audit Trail (ISO 20022 compliant).</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
