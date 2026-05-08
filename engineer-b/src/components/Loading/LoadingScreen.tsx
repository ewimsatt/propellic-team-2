import type { LoadingStage } from "../../types/audit.js";

const ALL_STAGES: LoadingStage[] = [
  "Fetching page...",
  "Analyzing signals...",
  "Generating recommendations...",
];

interface LoadingScreenProps {
  url: string;
  loadingStage: LoadingStage;
}

export function LoadingScreen({ url, loadingStage }: LoadingScreenProps) {
  const currentIndex = ALL_STAGES.indexOf(loadingStage);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-lg font-semibold text-slate-800">Auditing…</h2>
        </div>

        <p className="text-xs text-slate-400 font-mono truncate mb-8">{url}</p>

        <ol className="space-y-3">
          {ALL_STAGES.map((stage, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <li key={stage} className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                    done
                      ? "bg-green-500 text-white"
                      : active
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-sm ${
                    done
                      ? "text-green-600 line-through"
                      : active
                      ? "text-slate-800 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {stage}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
