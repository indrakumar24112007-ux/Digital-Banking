import React, { useState } from 'react';
import {
  FileCheck2,
  FilePlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Receipt as ReceiptIcon,
  Layers,
  ShieldCheck,
  UserCheck,
  Building,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { Rupee } from '../Rupee.tsx';
import { LoanType, LoanApplication, Loan, Receipt, EMISchedule } from '../../types/bank.ts';
import { bankEngine } from '../../services/bankEngine.ts';
import { calculateLoanEMI } from '../../utils/financialRules.ts';

import {
  getLoggedInUserAccounts,
  getLoggedInUserLoans,
  getLoggedInUserLoanApplications,
  getLoggedInUserCustomers,
} from '../../utils/userAccess.ts';

interface LoanManagementViewProps {
  onOpenReceipt: (receipt: Receipt) => void;
}

export const LoanManagementView: React.FC<LoanManagementViewProps> = ({
  onOpenReceipt,
}) => {
  const state = bankEngine.getState();
  const currentUser = state.currentUser;

  // Strict User Account Isolation: only the logged-in user's accounts, loans, and applications are accessible
  const accounts = getLoggedInUserAccounts(state);
  const loans = getLoggedInUserLoans(state);
  const applications = getLoggedInUserLoanApplications(state);
  const customers = getLoggedInUserCustomers(state);

  const [activeTab, setActiveTab] = useState<'applications' | 'activeLoans' | 'apply'>('activeLoans');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    currentUser?.customerId || (customers[0]?.customerId || 101)
  );
  const [loanType, setLoanType] = useState<LoanType>('Home Loan');
  const [requestedAmount, setRequestedAmount] = useState<number>(300000);
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const [linkedAccountNo, setLinkedAccountNo] = useState<string>(
    accounts[0]?.accountNo || 'ACC1001'
  );
  const [collateralType, setCollateralType] = useState('Residential Property');
  const [collateralValue, setCollateralValue] = useState<number>(2500000);
  const [guarantorName, setGuarantorName] = useState('Kumar S');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedLoanForEMI, setSelectedLoanForEMI] = useState<Loan | null>(null);

  const emiSchedules = state.emiSchedules;

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = bankEngine.submitLoanApplication({
      customerId: selectedCustomerId,
      loanType,
      requestedAmount: Number(requestedAmount),
      tenureMonths: Number(tenureMonths),
      linkedAccountNo,
      collateralType,
      collateralValue: Number(collateralValue),
      guarantorName,
    });

    if (res.success && res.application) {
      setMessage({
        text: `Loan Application #${res.application.applicationId} (${loanType}) submitted successfully! Credit Bureau score: ${res.application.creditScore}. Pending Bank Officer review.`,
        type: 'success',
      });
      setActiveTab('applications');
    } else {
      setMessage({ text: res.error || 'Failed to submit loan application.', type: 'error' });
    }
  };

  const handleOfficerReview = (appId: number, decision: 'APPROVE' | 'REJECT') => {
    setMessage(null);
    const res = bankEngine.reviewLoanApplication(appId, decision);
    if (res.success) {
      if (decision === 'APPROVE') {
        setMessage({
          text: `Application #${appId} APPROVED & DISBURSED! Loan funds credited to customer's account and EMI schedule generated.`,
          type: 'success',
        });
        setActiveTab('activeLoans');
      } else {
        setMessage({
          text: `Application #${appId} REJECTED and rejection notification dispatched.`,
          type: 'success',
        });
      }
    } else {
      setMessage({ text: res.error || 'Review failed.', type: 'error' });
    }
  };

  const handlePayEMI = (loanId: number, emiId: number, fromAcc: string) => {
    setMessage(null);
    const res = bankEngine.payLoanEMI(loanId, emiId, fromAcc, 'Net Banking');
    if (res.success && res.receipt) {
      setMessage({
        text: `EMI payment for Loan #${loanId} completed successfully!`,
        type: 'success',
      });
      onOpenReceipt(res.receipt);
    } else {
      setMessage({ text: res.error || 'Failed to pay EMI.', type: 'error' });
    }
  };

  const previewEMI = calculateLoanEMI(requestedAmount, 8.5, tenureMonths);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">
              My Loans & EMI Schedules
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Apply for loans, run automated Credit Bureau scoring, review and disburse, and track reducing-balance EMI schedules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('apply')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <FilePlus className="w-4 h-4" />
            <span>Apply For Loan</span>
          </button>
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('activeLoans')}
          className={`pb-3 px-2 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'activeLoans'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Active Loans ({loans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-2 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'applications'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Applications & Officer Review ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`pb-3 px-2 transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'apply'
              ? 'border-amber-600 text-amber-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>New Application Form</span>
        </button>
      </div>

      {/* ACTIVE LOANS TAB */}
      {activeTab === 'activeLoans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loans.map((loan) => {
              const cust = customers.find((c) => c.customerId === loan.customerId);
              const loanEmis = emiSchedules.filter((s) => s.loanId === loan.loanId);
              const paidCount = loanEmis.filter((s) => s.status === 'Paid').length;
              const pendingCount = loanEmis.filter((s) => s.status !== 'Paid').length;

              return (
                <div
                  key={loan.loanId}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-700">
                          Loan #{loan.loanId}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          {loan.loanType}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        Borrower: {cust?.customerName || 'Customer'}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Disbursed to: {loan.accountNo} • Date: {loan.startDate}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase">
                      {loan.status}
                    </span>
                  </div>

                  {/* Loan Figures */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3.5 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">
                        Principal
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        ₹{loan.loanAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">
                        Interest Rate
                      </span>
                      <p className="font-bold text-amber-700 mt-0.5">{loan.interestRate}% p.a.</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">
                        Monthly EMI
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        ₹{loan.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Collateral & Guarantor */}
                  {(loan.collateral || loan.guarantor) && (
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-slate-700 space-y-1">
                      {loan.collateral && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Collateral:</span>
                          <span className="font-semibold text-slate-800">
                            {loan.collateral.collateralType} (₹
                            {loan.collateral.collateralValue.toLocaleString()})
                          </span>
                        </div>
                      )}
                      {loan.guarantor && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Guarantor:</span>
                          <span className="font-semibold text-slate-800">
                            {loan.guarantor.guarantorName} ({loan.guarantor.relationship})
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>
                        EMIs Paid: {paidCount} / {loan.tenureMonths}
                      </span>
                      <span>Remaining: ₹{loan.remainingAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${(paidCount / loan.tenureMonths) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action: Open EMI Schedule */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setSelectedLoanForEMI(selectedLoanForEMI?.loanId === loan.loanId ? null : loan)
                      }
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-900"
                    >
                      <span>
                        {selectedLoanForEMI?.loanId === loan.loanId
                          ? 'Hide EMI Schedule'
                          : 'View & Pay EMI Schedule'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EMI Schedule Drawer for Selected Loan */}
          {selectedLoanForEMI && (
            <div className="bg-white rounded-2xl border border-amber-300 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    EMI Schedule for Loan #{selectedLoanForEMI.loanId} ({selectedLoanForEMI.loanType})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Loan Repayment Schedule Breakdown (Principal + Interest Amortization)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLoanForEMI(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Close
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="p-2.5">Installment #</th>
                      <th className="p-2.5">Due Date</th>
                      <th className="p-2.5">EMI Total</th>
                      <th className="p-2.5">Principal</th>
                      <th className="p-2.5">Interest</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {emiSchedules
                      .filter((s) => s.loanId === selectedLoanForEMI.loanId)
                      .map((emi) => (
                        <tr key={emi.emiId} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800">
                            #{emi.installmentNumber}
                          </td>
                          <td className="p-2.5 text-slate-600">{emi.dueDate}</td>
                          <td className="p-2.5 font-bold text-slate-900">
                            ₹{emi.emiAmount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            ₹{emi.principalAmount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-amber-700">
                            ₹{emi.interestAmount.toLocaleString()}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                emi.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {emi.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            {emi.status !== 'Paid' ? (
                              <button
                                onClick={() =>
                                  handlePayEMI(
                                    selectedLoanForEMI.loanId,
                                    emi.emiId,
                                    selectedLoanForEMI.accountNo
                                  )
                                }
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shadow-2xs"
                              >
                                Pay EMI
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Paid on {emi.paidDate}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS & OFFICER REVIEW TAB */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Loan Applications Pipeline & Credit Verification
              </h3>
              <p className="text-xs text-slate-500">
                Credit Bureau Verification & Loan Sanction Pipeline
              </p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Credit & Risk Assessment Portal</span>
            </div>
          </div>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.applicationId}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      App #{app.applicationId}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{app.customerName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      {app.loanType}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Requested: <span className="font-bold text-slate-900">₹{app.requestedAmount.toLocaleString()}</span> for{' '}
                    <span className="font-bold">{app.tenureMonths} months</span> • Linked Account:{' '}
                    <span className="font-mono">{app.linkedAccountNo}</span>
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Credit Bureau Score:</span>
                      <strong className={app.creditScore >= 750 ? 'text-emerald-600' : 'text-amber-600'}>
                        {app.creditScore} / 900
                      </strong>
                    </span>
                    <span>Applied: {app.applicationDate}</span>
                  </div>

                  {app.rejectionReason && (
                    <p className="text-xs text-rose-600 italic">Rejection note: {app.rejectionReason}</p>
                  )}
                </div>

                {/* Officer Action Buttons if Submitted or Under Review (only visible to bank officers/managers) */}
                {app.status !== 'APPROVED' && app.status !== 'REJECTED' && (
                  currentUser?.role !== 'Bank Officer' && currentUser?.role !== 'Administrator' ? (
                    <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                      Under Review by Bank Officer
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleOfficerReview(app.applicationId, 'REJECT')}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => handleOfficerReview(app.applicationId, 'APPROVE')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                      >
                        Approve & Disburse
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW APPLICATION FORM TAB */}
      {activeTab === 'apply' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Submit New Loan Application</h3>
            <p className="text-xs text-slate-500">
              Automated Credit Bureau scoring and reducing-balance repayment plan
            </p>
          </div>

          <form onSubmit={handleApplyLoan} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Applicant *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      #{c.customerId} - {c.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Loan Product Type *</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value as LoanType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Home Loan">Home Loan (8.25% p.a.)</option>
                  <option value="Car Loan">Car Loan (9.0% p.a.)</option>
                  <option value="Personal Loan">Personal Loan (11.5% p.a.)</option>
                  <option value="Education Loan">Education Loan (7.9% p.a.)</option>
                  <option value="Business Loan">Business Loan (10.5% p.a.)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Loan Amount (₹) *</label>
                <input
                  type="number"
                  min={10000}
                  required
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tenure (Months) *</label>
                <input
                  type="number"
                  min={6}
                  max={240}
                  required
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">
                  Disbursement Account (Linked Account) *
                </label>
                <select
                  value={linkedAccountNo}
                  onChange={(e) => setLinkedAccountNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                >
                  {accounts
                    .filter((a) => a.status === 'Active')
                    .map((acc) => (
                      <option key={acc.accountNo} value={acc.accountNo}>
                        {acc.accountNo} ({acc.accountType})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Collateral Description</label>
                <input
                  type="text"
                  value={collateralType}
                  onChange={(e) => setCollateralType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Collateral Value (₹)</label>
                <input
                  type="number"
                  value={collateralValue}
                  onChange={(e) => setCollateralValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Guarantor Name & Contact</label>
                <input
                  type="text"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Live EMI calculation widget */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-amber-800">
                  Estimated Monthly EMI (Amortized)
                </span>
                <p className="text-xl font-extrabold text-amber-900">
                  ₹{previewEMI.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / month
                </p>
              </div>
              <span className="text-[11px] text-amber-800 font-mono">
                Formula: P·r·(1+r)ⁿ / ((1+r)ⁿ - 1)
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('activeLoans')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm"
              >
                Submit Loan Application
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
