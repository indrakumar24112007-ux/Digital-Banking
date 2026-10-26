import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  Building,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { Customer, CustomerType, CustomerStatus, AccountType } from '../../types/bank.ts';
import { bankEngine } from '../../services/bankEngine.ts';
import { getLoggedInUserCustomers } from '../../utils/userAccess.ts';

interface CustomerManagementViewProps {
  // Pure banking view without UML mentions
}

export const CustomerManagementView: React.FC<CustomerManagementViewProps> = () => {
  const state = bankEngine.getState();
  const currentUser = state.currentUser;

  // Strict User Account Isolation: only the logged-in customer's profile is accessible
  const customers = getLoggedInUserCustomers(state);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Customer Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [custType, setCustType] = useState<CustomerType>('Individual');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [occupation, setOccupation] = useState('');
  const [incomeRange, setIncomeRange] = useState('10L_20L');
  const [docType, setDocType] = useState<Customer['documents'][0]['documentType']>('Aadhaar Card');
  const [docNumber, setDocNumber] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Savings');
  const [initialDeposit, setInitialDeposit] = useState<number>(5000);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.customerId.toString().includes(searchQuery);
    const matchesType = selectedType === 'ALL' || c.customerType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = bankEngine.registerCustomer({
      customerName: name,
      email,
      phone,
      customerType: custType,
      street,
      city,
      state: stateName,
      occupation,
      incomeRange,
      idDocType: docType,
      idDocNumber: docNumber,
      initialAccountType: accountType,
      initialDeposit: Number(initialDeposit),
    });

    if (res.success) {
      setMessage({
        text: `Customer ${res.customer?.customerName} registered successfully with ID #${res.customer?.customerId} and Account #${res.account?.accountNo}!`,
        type: 'success',
      });
      setShowAddModal(false);
      resetForm();
    } else {
      setMessage({ text: res.error || 'Failed to register customer', type: 'error' });
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setMessage(null);

    const res = bankEngine.updateCustomerDetails(editingCustomer.customerId, {
      customerName: editingCustomer.customerName,
      phone: editingCustomer.phone,
      occupation: editingCustomer.profile?.occupation,
      incomeRange: editingCustomer.profile?.incomeRange,
      street: editingCustomer.addresses[0]?.street,
      city: editingCustomer.addresses[0]?.city,
      state: editingCustomer.addresses[0]?.state,
    });

    if (res.success) {
      setMessage({ text: 'Customer details updated successfully.', type: 'success' });
      setEditingCustomer(null);
    } else {
      setMessage({ text: res.error || 'Failed to update', type: 'error' });
    }
  };

  const handleStatusToggle = (customerId: number, currentStatus: CustomerStatus) => {
    const nextStatus: CustomerStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    bankEngine.setCustomerStatus(customerId, nextStatus);
    setMessage({
      text: `Customer #${customerId} status updated to ${nextStatus}.`,
      type: 'success',
    });
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCustType('Individual');
    setStreet('');
    setCity('');
    setOccupation('');
    setDocNumber('');
    setInitialDeposit(5000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">
              My Customer Profile & KYC Details
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Your registered profile, verified address, and KYC identity documents on file.
          </p>
        </div>
      </div>

      {/* Status Alert Banner */}
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium">Customer Type:</span>
          {['ALL', 'Individual', 'Corporate', 'Joint'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === t
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custAccounts = state.accounts.filter((a) => a.customerId === cust.customerId);
          return (
            <div
              key={cust.customerId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      ID #{cust.customerId}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{cust.customerName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {cust.customerType} Customer
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          cust.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cust.status === 'KYC Verification Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {/* Profile and Contact details */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">{cust.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono font-medium text-slate-800">{cust.phone}</span>
                  </div>
                  {cust.addresses[0] && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[180px]">
                        {cust.addresses[0].city}, {cust.addresses[0].state}
                      </span>
                    </div>
                  )}
                  {cust.profile && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Occupation:</span>
                      <span className="font-medium text-slate-800">{cust.profile.occupation}</span>
                    </div>
                  )}
                </div>

                {/* KYC Documents */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase">
                    <span>KYC Verification Documents</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  {cust.documents.map((d) => (
                    <div
                      key={d.documentId}
                      className="flex items-center justify-between text-xs font-mono bg-white p-1.5 rounded border border-slate-200"
                    >
                      <span className="font-semibold text-slate-700">{d.documentType}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          d.status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Linked Accounts */}
                <div className="text-xs space-y-1">
                  <span className="text-slate-400 font-medium">Owned Accounts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {custAccounts.map((a) => (
                      <span
                        key={a.accountNo}
                        className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[11px] font-mono text-blue-800 font-semibold"
                      >
                        {a.accountNo} (₹{a.balance.toLocaleString()})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <button
                  onClick={() => setEditingCustomer(cust)}
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Details</span>
                </button>

                <button
                  onClick={() => handleStatusToggle(cust.customerId, cust.status)}
                  className={`inline-flex items-center space-x-1 font-semibold ${
                    cust.status === 'Active'
                      ? 'text-rose-600 hover:text-rose-800'
                      : 'text-emerald-600 hover:text-emerald-800'
                  }`}
                >
                  {cust.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Bank Customer</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Customer Onboarding & Verification Workflow
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer Type *</label>
                  <select
                    value={custType}
                    onChange={(e) => setCustType(e.target.value as CustomerType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Individual">Individual Customer</option>
                    <option value="Corporate">Corporate Customer</option>
                    <option value="Joint">Joint Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Address Composition */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Address (Composition 1 : 1..*)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="col-span-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Profile & Document Composition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. Architect"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Income Range</label>
                  <select
                    value={incomeRange}
                    onChange={(e) => setIncomeRange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="5L_10L">₹5 Lakh - ₹10 Lakh</option>
                    <option value="10L_20L">₹10 Lakh - ₹20 Lakh</option>
                    <option value="20L_35L">₹20 Lakh - ₹35 Lakh</option>
                    <option value="50L+">₹50 Lakh+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">KYC Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="ITR">Income Tax Return</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Document Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 5432-8877-1234"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Primary Account Initialization */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                  Primary Account Creation (par Create Account)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-blue-800 font-semibold mb-1">Account Type</label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs"
                    >
                      <option value="Savings">Savings Account (4.0% interest)</option>
                      <option value="Current">Current Account (₹50k Overdraft)</option>
                      <option value="Fixed">Fixed Deposit Account (7.2% interest)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-blue-800 font-semibold mb-1">Opening Deposit (₹)</label>
                    <input
                      type="number"
                      min={1000}
                      value={initialDeposit}
                      onChange={(e) => setInitialDeposit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Save & Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Update Customer #{editingCustomer.customerId} Details
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={editingCustomer.customerName}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, customerName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingCustomer.phone}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              {editingCustomer.profile && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editingCustomer.profile.occupation}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        profile: { ...editingCustomer.profile!, occupation: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
