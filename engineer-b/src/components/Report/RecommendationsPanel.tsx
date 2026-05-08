import type { Recommendation, Effort } from "../../types/audit.js";

const EFFORT_COLORS: Record<Effort, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const GOAL_LABELS: Record<string, string> = {
  direct_booking: "Direct Booking",
  lead_submission: "Lead Submission",
  both: "Both Goals",
};

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">{rec.title}</h3>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${EFFORT_COLORS[rec.effort]}`}
            >
              {rec.effort} effort
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
              {GOAL_LABELS[rec.goalRelevance]}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{rec.rationale}</p>

      <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Suggested Fix
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{rec.suggestedFix}</p>
      </div>
    </div>
  );
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Recommendations</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Sorted by impact — fix #1 first
        </p>
      </div>

      <div className="p-6 space-y-4">
        {sorted.map((rec, i) => (
          <RecommendationCard key={rec.id} rec={rec} index={i} />
        ))}
      </div>
    </section>
  );
}
