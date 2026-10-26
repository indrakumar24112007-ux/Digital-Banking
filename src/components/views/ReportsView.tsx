import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { bankEngine } from '../../services/bankEngine.ts';
import { AuditLog } from '../../types/bank.ts';
import {
  getLoggedInUserAccounts,
  getLoggedInUserTransactions,
  getLoggedInUserLoans,
} from '../../utils/userAccess.ts';

interface ReportsViewProps {
  // Pure banking view without UML mentions
}

export const ReportsView: React.FC<ReportsViewProps> = () => {
  const state = bankEngine.getState();
  const currentUser = state.currentUser;

  // Strict User Account Isolation: only the logged-in user's account is accessed and visible
  const accounts = getLoggedInUserAccounts(state);
  const transactions = getLoggedInUserTransactions(state);
  const loans = getLoggedInUserLoans(state);

  const [reportType, setReportType] = useState<'transactions' | 'accounts' | 'loans'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = `digital_banking_${reportType}_report.csv`;

    if (reportType === 'transactions') {
      csvContent = 'Transaction ID,Account No,Type,Amount,Date,Status,Description\n';
      transactions.forEach((t) => {
        csvContent += `"${t.transactionId}","${t.accountNo}","${t.type}","${t.amount}","${t.transDate}","${t.status}","${t.description}"\n`;
      });
    } else if (reportType === 'accounts') {
      csvContent = 'Account ID,Account No,Customer ID,Type,Balance,Status,Open Date\n';
      accounts.forEach((a) => {
        csvContent += `"${a.accountId}","${a.accountNo}","${a.customerId}","${a.accountType}","${a.balance}","${a.status}","${a.openDate}"\n`;
      });
    } else if (reportType === 'loans') {
      csvContent = 'Loan ID,Customer ID,Account No,Loan Type,Principal Amount,Interest Rate,Remaining,Status\n';
      loans.forEach((l) => {
        csvContent += `"${l.loanId}","${l.customerId}","${l.accountNo}","${l.loanType}","${l.loanAmount}","${l.interestRate}","${l.remainingAmount}","${l.status}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTabs = [
    { id: 'transactions', label: `My Transactions (${transactions.length})` },
    { id: 'accounts', label: `My Account (${accounts.length})` },
    { id: 'loans', label: `My Loans (${loans.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">
              Account Statements & Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Download official bank statements, transaction histories, and loan repayment schedules with Export CSV and Print features.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold overflow-x-auto pb-1">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`pb-3 px-2 transition border-b-2 whitespace-nowrap ${
              reportType === tab.id
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Data Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        {/* Table Content */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          {reportType === 'transactions' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3">Txn ID</th>
                  <th className="p-3">Account</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {state.transactions.map((t) => (
                  <tr key={t.transactionId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-700">#{t.transactionId}</td>
                    <td className="p-3 font-semibold text-blue-700">{t.accountNo}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.type === 'Deposit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.type === 'Withdraw'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-bold ${
                        t.type === 'Deposit' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-slate-500">{t.transDate}</td>
                    <td className="p-3 text-emerald-600 font-semibold">{t.status}</td>
                    <td className="p-3 font-sans text-slate-800 max-w-xs truncate">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'accounts' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3">Account No</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3">Facility / Rate</th>
                  <th className="p-3">Open Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {state.accounts.map((a) => {
                  const owner = state.customers.find((c) => c.customerId === a.customerId);
                  return (
                    <tr key={a.accountNo} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-blue-700">{a.accountNo}</td>
                      <td className="p-3 font-semibold">{a.accountType}</td>
                      <td className="p-3 font-sans">{owner?.customerName}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        ₹{a.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-slate-600">
                        {a.accountType === 'Savings' && `${a.interestRate}% p.a.`}
                        {a.accountType === 'Current' && `Overdraft: ₹${a.overdraftLimit.toLocaleString()}`}
                        {a.accountType === 'Fixed' && `${a.interestRate}% p.a. (Matures: ${a.maturityDate})`}
                      </td>
                      <td className="p-3 text-slate-500">{a.openDate}</td>
                      <td className="p-3 text-emerald-600 font-semibold">{a.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'loans' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase">
                <tr>
                  <th className="p-3">Loan ID</th>
                  <th className="p-3">Borrower</th>
                  <th className="p-3">Loan Type</th>
                  <th className="p-3 text-right">Principal</th>
                  <th className="p-3 text-right">Monthly EMI</th>
                  <th className="p-3 text-right">Remaining</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {state.loans.map((l) => {
                  const cust = state.customers.find((c) => c.customerId === l.customerId);
                  return (
                    <tr key={l.loanId} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-amber-700">#{l.loanId}</td>
                      <td className="p-3 font-sans font-semibold">{cust?.customerName}</td>
                      <td className="p-3">{l.loanType}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        ₹{l.loanAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        ₹{l.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-amber-800">
                        ₹{l.remainingAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-emerald-600 font-semibold">{l.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
