import type { FrictionMap, FrictionItem, Priority } from "../../types/audit.js";
import { ScoreRing } from "./ScoreRing.js";

const PRIORITY_BADGE: Record<Priority, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

function FrictionItemCard({ item }: { item: FrictionItem }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 mt-0.5 ${PRIORITY_BADGE[item.priority]}`}
        >
          {item.priority}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
      </div>
      <p className="text-sm text-slate-600">{item.description}</p>
      {item.affectedSelector && (
        <code className="block text-xs bg-slate-100 rounded px-2 py-1 font-mono text-slate-600 break-all">
          {item.affectedSelector}
        </code>
      )}
    </div>
  );
}

function FieldCountBar({
  actual,
  benchmark,
}: {
  actual: number;
  benchmark: number;
}) {
  const max = Math.max(actual, benchmark, 1);
  const overBenchmark = actual > benchmark;
  const excess = actual - benchmark;
  const estimatedLoss = Math.round(excess * 11);

  return (
    <div className="bg-slate-50 rounded-xl p-4 mb-6">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
        Form Field Count
      </p>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Your form</span>
            <span className="font-semibold text-slate-800">{actual} fields</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overBenchmark ? "bg-red-400" : "bg-green-400"}`}
              style={{ width: `${(actual / max) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Benchmark</span>
            <span className="font-semibold text-slate-800">{benchmark} fields</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-400"
              style={{ width: `${(benchmark / max) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {overBenchmark && (
        <p className="text-xs text-red-600 font-medium mt-3">
          ~{estimatedLoss}% estimated conversion loss from excess fields
        </p>
      )}
    </div>
  );
}

interface FrictionMapPanelProps {
  frictionMap: FrictionMap;
}

export function FrictionMapPanel({ frictionMap }: FrictionMapPanelProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-6 border-b border-slate-100">
        <ScoreRing score={frictionMap.score} />
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Friction Map</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {frictionMap.items.length} friction point
            {frictionMap.items.length !== 1 ? "s" : ""} identified
          </p>
        </div>
      </div>

      <div className="p-6">
        <FieldCountBar
          actual={frictionMap.formFieldCount}
          benchmark={frictionMap.benchmarkFieldCount}
        />

        <div className="space-y-3">
          {frictionMap.items.map((item) => (
            <FrictionItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
