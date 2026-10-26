import React, { useState } from 'react';
import { UML_DIAGRAMS, UMLDiagramDef } from '../data/umlDiagramsData.ts';
import {
  X,
  Layers,
  Search,
  BookOpen,
  UserCheck,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from 'lucide-react';

interface UMLViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDiagramId?: string;
}

export const UMLViewerModal: React.FC<UMLViewerModalProps> = ({
  isOpen,
  onClose,
  initialDiagramId,
}) => {
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>(
    initialDiagramId || UML_DIAGRAMS[0].id
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const currentDiagram =
    UML_DIAGRAMS.find((d) => d.id === selectedDiagramId) || UML_DIAGRAMS[0];

  const categories = ['ALL', 'Use Case', 'Class', 'Sequence', 'Activity', 'Statechart', 'Component', 'Deployment'];

  const filteredDiagrams = UML_DIAGRAMS.filter((d) => {
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesQuery =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.authors.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>OOAD Bank Management System — UML Architecture Explorer</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/60">
                  Full Traceability
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connected to OOAD Diagrams by A Jaya Suriya (25MIS0475), S Indra Kumar (25MIS0092), E Muhammad Sharukh (25MIS0104)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close UML Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Diagram Selector */}
          <div className="w-full md:w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col shrink-0">
            {/* Search & Category filter */}
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search UML diagrams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2 py-1 rounded whitespace-nowrap transition ${
                      selectedCategory === c
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagram List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredDiagrams.map((diag) => {
                const isSelected = diag.id === currentDiagram.id;
                return (
                  <button
                    key={diag.id}
                    onClick={() => setSelectedDiagramId(diag.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex flex-col space-y-1 ${
                      isSelected
                        ? 'bg-blue-600/20 border border-blue-500 text-white shadow-md'
                        : 'bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-bold">
                        {diag.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{diag.pageRef}</span>
                    </div>
                    <span className="text-xs font-semibold">{diag.title}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{diag.authors}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Interactive Visual Diagram & Specs */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900">
            {/* Diagram Header Info */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold uppercase">
                    {currentDiagram.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {currentDiagram.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Reference: {currentDiagram.pageRef}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentDiagram.summary}
              </p>

              <div className="text-xs text-blue-400 font-medium pt-1">
                Author / Designer: <span className="text-slate-200">{currentDiagram.authors}</span>
              </div>
            </div>

            {/* Visual Diagram Representation (Clean Interactive SVG) */}
            <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 overflow-x-auto min-h-[300px] flex items-center justify-center">
              {renderVisualDiagram(currentDiagram)}
            </div>

            {/* Elements & Connections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Elements in diagram */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>Components & Elements In Diagram ({currentDiagram.elements.length})</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {currentDiagram.elements.map((el, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex flex-col space-y-0.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{el.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-blue-300 font-mono">
                          {el.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{el.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationships & Connections */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Relationships & Message Links ({currentDiagram.connections.length})</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {currentDiagram.connections.map((conn, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-blue-300 font-medium">{conn.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-emerald-300 font-medium">{conn.to}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-amber-300 rounded font-semibold">
                        {conn.label || conn.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to render high-contrast structured diagrams for each UML diagram
function renderVisualDiagram(diagram: UMLDiagramDef) {
  if (diagram.id === 'overall-usecase') {
    return (
      <div className="w-full max-w-4xl py-6 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Customer Actors */}
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-blue-900/40 border border-blue-500 rounded-xl text-center w-36">
              <div className="text-2xl mb-1">👤</div>
              <div className="font-bold text-xs text-white">Customer</div>
              <div className="text-[10px] text-blue-300">Actor</div>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">
                New Customer
              </span>
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">
                Existing Customer
              </span>
            </div>
          </div>

          {/* System Boundary Box */}
          <div className="flex-1 bg-slate-900/90 border-2 border-blue-500/50 rounded-2xl p-4 shadow-xl">
            <div className="text-center font-mono font-bold text-xs uppercase tracking-wider text-blue-400 mb-4 pb-2 border-b border-slate-800">
              System Boundary: Bank Management System
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                'Login',
                'Customer Management',
                'Account Management',
                'Transaction Management',
                'Make Payment',
                'Loan Management',
                'View Receipt',
                'Logout',
              ].map((uc, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-800/80 border border-slate-700 hover:border-blue-400 rounded-full text-center text-xs font-medium text-slate-200 shadow-sm"
                >
                  ({uc})
                </div>
              ))}
            </div>
          </div>

          {/* Bank Employee Actors */}
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-purple-900/40 border border-purple-500 rounded-xl text-center w-36">
              <div className="text-2xl mb-1">👔</div>
              <div className="font-bold text-xs text-white">Bank Employee</div>
              <div className="text-[10px] text-purple-300">Actor</div>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">
                Bank Officer
              </span>
              <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300">
                Bank Manager
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (diagram.id === 'overall-class') {
    return (
      <div className="w-full max-w-4xl py-4 space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bank Class */}
          <div className="bg-slate-900 border border-blue-500/60 rounded-lg p-3">
            <div className="text-center font-bold text-blue-300 border-b border-slate-800 pb-1 mb-2">
              «Entity» Bank
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>+bankId: int</div>
              <div>+bankName: String</div>
              <div>+address: String</div>
              <div>+phone: String</div>
            </div>
            <div className="border-t border-slate-800 pt-1 mt-2 text-[11px] text-emerald-400">
              +maintainRecord(): void
            </div>
          </div>

          {/* Customer Class */}
          <div className="bg-slate-900 border border-emerald-500/60 rounded-lg p-3">
            <div className="text-center font-bold text-emerald-300 border-b border-slate-800 pb-1 mb-2">
              «Entity» Customer
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>+customerId: int</div>
              <div>+name: String</div>
              <div>+address: String</div>
              <div>+phone: String</div>
              <div>+email: String</div>
            </div>
            <div className="border-t border-slate-800 pt-1 mt-2 text-[11px] text-emerald-400">
              +updateCustomer(): void
            </div>
          </div>

          {/* Login & AuthenticateService */}
          <div className="bg-slate-900 border border-purple-500/60 rounded-lg p-3">
            <div className="text-center font-bold text-purple-300 border-b border-slate-800 pb-1 mb-2">
              «Boundary» Login
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>+userId: int</div>
              <div>+userName: String</div>
              <div>+password: String</div>
              <div>+role: String</div>
            </div>
            <div className="border-t border-slate-800 pt-1 mt-2 text-[11px] text-purple-400">
              +login(): boolean
              <br />
              +logout(): void
            </div>
          </div>
        </div>

        {/* Second Row: Account, Current, Savings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-lg p-3">
            <div className="text-center font-bold text-amber-300 border-b border-slate-800 pb-1 mb-2">
              «Entity» Account
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>+accountNo: long</div>
              <div>+accountType: String</div>
              <div>+balance: double</div>
              <div>+status: String</div>
            </div>
            <div className="border-t border-slate-800 pt-1 mt-2 text-[11px] text-amber-400">
              +deposit(amount): void
              <br />
              +withdraw(amount): boolean
              <br />
              +checkBalance(): double
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div className="text-center font-bold text-blue-300 border-b border-slate-800 pb-1 mb-2">
              CurrentAccount ▻ Account
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>+overdraftLimit: double</div>
            </div>
            <div className="border-t border-slate-800 pt-1 mt-2 text-[11px] text-blue-400">
              +checkLimit(): boolean
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <div className="text-center font-bold text-emerald-300 border-b border-slate-800 pb-1 mb-2">
              SavingsAccount ▻ Account
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>+interestRate: double</div>
            </div>
            <div className="border-t border-slate-800 pt-1 mt-2 text-[11px] text-emerald-400">
              +calculateInterest(): void
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default flow visualization
  return (
    <div className="w-full max-w-3xl py-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-mono text-slate-400">Architecture Interaction Pipeline</span>
        <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
          UML Validated
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {diagram.elements.map((el, i) => (
          <React.Fragment key={i}>
            <div className="bg-slate-900 border border-slate-700 hover:border-blue-500 p-3 rounded-xl text-center min-w-[130px] shadow-sm">
              <span className="text-[10px] uppercase font-mono text-blue-400 font-bold block mb-1">
                {el.type}
              </span>
              <span className="text-xs font-bold text-white block">{el.name}</span>
              <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">{el.details}</span>
            </div>
            {i < diagram.elements.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
