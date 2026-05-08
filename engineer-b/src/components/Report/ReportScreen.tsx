import type { AuditResult } from "../../types/audit.js";
import { ScoreRing } from "./ScoreRing.js";
import { VisualAuditPanel } from "./VisualAuditPanel.js";
import { FrictionMapPanel } from "./FrictionMapPanel.js";
import { RecommendationsPanel } from "./RecommendationsPanel.js";

interface ReportScreenProps {
  result: AuditResult;
  onReset: () => void;
}

export function ReportScreen({ result, onReset }: ReportScreenProps) {
  const scanDate = new Date(result.scannedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-mono truncate">{result.finalUrl}</p>
              <p className="text-xs text-slate-400 mt-0.5">Scanned {scanDate}</p>
            </div>
            <button
              onClick={onReset}
              className="flex-shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
            >
              New Audit
            </button>
          </div>

          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-3">
              <ScoreRing score={result.visualAudit.score} size={64} />
              <div>
                <p className="text-xs text-slate-500 font-medium">Visual Score</p>
                <p className="text-xl font-bold text-slate-800">{result.visualAudit.score}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ScoreRing score={result.frictionMap.score} size={64} />
              <div>
                <p className="text-xs text-slate-500 font-medium">Friction Score</p>
                <p className="text-xl font-bold text-slate-800">{result.frictionMap.score}</p>
              </div>
            </div>
          </div>
        </div>

        <VisualAuditPanel
          visualAudit={result.visualAudit}
          screenshotBase64={result.screenshotBase64}
        />

        <FrictionMapPanel frictionMap={result.frictionMap} />

        <RecommendationsPanel recommendations={result.recommendations} />
      </div>
    </div>
  );
}
