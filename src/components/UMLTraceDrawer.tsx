import React, { useState } from 'react';
import { UMLTraceStep } from '../types/bank.ts';
import {
  Activity,
  Layers,
  ChevronUp,
  ChevronDown,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

interface UMLTraceDrawerProps {
  traces: UMLTraceStep[];
  currentUMLState: {
    module: string;
    stateName: string;
    substate?: string;
  };
  onOpenDiagramViewer: (diagramId?: string) => void;
  onClearTraces?: () => void;
}

export const UMLTraceDrawer: React.FC<UMLTraceDrawerProps> = ({
  traces,
  currentUMLState,
  onOpenDiagramViewer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterModule, setFilterModule] = useState<string>('ALL');

  const filteredTraces =
    filterModule === 'ALL' ? traces : traces.filter((t) => t.module === filterModule);

  return (
    <div
      className={`fixed bottom-0 right-0 left-0 z-40 transition-all duration-300 ease-in-out border-t border-slate-700/60 shadow-2xl ${
        isOpen ? 'h-80' : 'h-11'
      } bg-slate-900 text-slate-100 flex flex-col`}
    >
      {/* Top Bar / Handle */}
      <div className="h-11 px-4 flex items-center justify-between bg-slate-950 border-b border-slate-800 text-xs font-mono select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400 uppercase tracking-wider">
              Live UML Engine Trace
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Current State Indicator */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded text-slate-300">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>State:</span>
            <span className="text-white font-bold">{currentUMLState.stateName}</span>
            {currentUMLState.substate && (
              <span className="text-blue-300">({currentUMLState.substate})</span>
            )}
          </div>

          <span className="text-slate-500 text-[11px] hidden md:inline">
            ({traces.length} steps recorded)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenDiagramViewer()}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 rounded text-xs transition"
            title="Inspect Full UML Diagrams"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View UML Diagrams</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
            aria-label={isOpen ? 'Collapse Trace Drawer' : 'Expand Trace Drawer'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="hidden sm:inline">{isOpen ? 'Minimize' : 'Inspect'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Console Content */}
      {isOpen && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Filter subheader */}
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                Module Filter:
              </span>
              {['ALL', 'Login', 'Customer', 'Account', 'Transaction', 'Payment', 'Loan'].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterModule(m)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    filterModule === m
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>Strict UML sequence & statechart dispatch</span>
            </div>
          </div>

          {/* Steps List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
            {filteredTraces.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                No UML execution events recorded yet for this filter.
              </div>
            ) : (
              filteredTraces.map((trace) => (
                <div
                  key={trace.id}
                  className="flex items-start justify-between bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 hover:border-blue-500/40 transition"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {trace.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : trace.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-blue-300 font-bold uppercase">
                          {trace.diagram}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-purple-300 font-bold">
                          {trace.module}
                        </span>
                        <span className="text-slate-400 font-semibold">{trace.source}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="text-emerald-300 font-semibold">{trace.target}</span>
                      </div>

                      <p className="text-slate-200 text-xs font-semibold pl-1">{trace.message}</p>
                      {trace.note && (
                        <p className="text-amber-300 text-[11px] pl-1 font-sans italic">
                          Guard/Note: {trace.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 whitespace-nowrap ml-2">
                    {trace.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
