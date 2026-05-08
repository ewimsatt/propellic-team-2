import { useState } from "react";
import type { VisualAudit, AuditSignal, SignalStatus } from "../../types/audit.js";
import { ScoreRing } from "./ScoreRing.js";

const STATUS_COLORS: Record<SignalStatus, string> = {
  pass: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  fail: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_DOT: Record<SignalStatus, string> = {
  pass: "bg-green-500",
  warning: "bg-amber-400",
  fail: "bg-red-500",
};

function SignalRow({ signal }: { signal: AuditSignal }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border ${STATUS_COLORS[signal.status]} overflow-hidden`}>
      <button
        className="w-full text-left px-4 py-3 flex items-center gap-3"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[signal.status]}`} />
        <span className="flex-1 text-sm font-medium">{signal.name}</span>
        <span className="text-xs uppercase tracking-wide opacity-70">{signal.status}</span>
        <svg
          className={`w-4 h-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-current border-opacity-20">
          <p className="text-sm">{signal.detail}</p>
          {signal.benchmarkNote && (
            <p className="text-xs opacity-70 italic">{signal.benchmarkNote}</p>
          )}
          {signal.selector && (
            <code className="block text-xs bg-black bg-opacity-10 rounded px-2 py-1 font-mono">
              {signal.selector}
            </code>
          )}
        </div>
      )}
    </div>
  );
}

interface VisualAuditPanelProps {
  visualAudit: VisualAudit;
  screenshotBase64: string | null;
}

export function VisualAuditPanel({ visualAudit, screenshotBase64 }: VisualAuditPanelProps) {
  const passed = visualAudit.signals.filter((s) => s.status === "pass").length;
  const warnings = visualAudit.signals.filter((s) => s.status === "warning").length;
  const failed = visualAudit.signals.filter((s) => s.status === "fail").length;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100">
        <ScoreRing score={visualAudit.score} />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-800">Visual Audit</h2>
          <div className="flex gap-3 mt-1.5 text-xs font-medium">
            <span className="text-green-600">{passed} passed</span>
            <span className="text-amber-600">{warnings} warnings</span>
            <span className="text-red-600">{failed} failed</span>
          </div>
        </div>
      </div>

      {screenshotBase64 && (
        <div className="border-b border-slate-100">
          <img
            src={`data:image/jpeg;base64,${screenshotBase64}`}
            alt="Page screenshot"
            className="w-full object-cover max-h-64"
          />
        </div>
      )}

      <div className="p-6 space-y-3">
        {visualAudit.signals.map((signal) => (
          <SignalRow key={signal.id} signal={signal} />
        ))}
      </div>
    </section>
  );
}
