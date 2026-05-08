import { useState } from "react";
import type { AuditRequest, GoalType } from "../../types/audit.js";

interface InputScreenProps {
  onSubmit: (req: AuditRequest) => void;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function InputScreen({ onSubmit }: InputScreenProps) {
  const [url, setUrl] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("direct_booking");
  const [touched, setTouched] = useState(false);

  const valid = isValidUrl(url);
  const showError = touched && !valid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ url, goalType });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">CRO Auditor</h1>
          <p className="text-slate-500 text-sm mt-1">
            Audit any URL against travel-industry conversion benchmarks.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Page URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="https://yoursite.com/booking"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                showError
                  ? "border-red-400 focus:border-red-500 bg-red-50"
                  : "border-slate-300 focus:border-indigo-500"
              }`}
            />
            {showError && (
              <p className="text-red-500 text-xs mt-1.5">
                Please enter a valid http or https URL.
              </p>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Goal Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    value: "direct_booking" as GoalType,
                    label: "Direct Booking",
                    sub: "Optimize for completed reservations",
                  },
                  {
                    value: "lead_submission" as GoalType,
                    label: "Lead Submission",
                    sub: "Optimize for inquiry form fills",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGoalType(option.value)}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                    goalType === option.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${
                      goalType === option.value
                        ? "text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{option.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Run Audit
          </button>
        </form>
      </div>
    </div>
  );
}
