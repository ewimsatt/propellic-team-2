import { useState, useCallback } from "react";
import type {
  AuditResult,
  AuditStatus,
  AuditRequest,
  AuditErrorResponse,
  LoadingStage,
} from "../types/audit.js";
import mockData from "../../mock/audit-response.json";

const USE_MOCK = true;

const LOADING_STAGES: LoadingStage[] = [
  "Fetching page...",
  "Analyzing signals...",
  "Generating recommendations...",
];

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

interface UseAuditReturn {
  status: AuditStatus;
  result: AuditResult | null;
  error: string | null;
  loadingStage: LoadingStage | null;
  runAudit: (req: AuditRequest) => void;
  reset: () => void;
}

export function useAudit(): UseAuditReturn {
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState<LoadingStage | null>(null);

  const runAudit = useCallback(
    (req: AuditRequest) => {
      setStatus("loading");
      setResult(null);
      setError(null);
      setLoadingStage(LOADING_STAGES[0]);

      void (async () => {
        try {
          if (USE_MOCK) {
            for (const stage of LOADING_STAGES) {
              setLoadingStage(stage);
              await delay(800);
            }
            setResult(mockData as unknown as AuditResult);
            setStatus("success");
            setLoadingStage(null);
            return;
          }

          setLoadingStage("Fetching page...");
          const response = await fetch("/api/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
          });

          setLoadingStage("Analyzing signals...");

          if (!response.ok) {
            const errBody = (await response.json()) as AuditErrorResponse;
            throw new Error(errBody.message ?? "Audit failed");
          }

          setLoadingStage("Generating recommendations...");
          const data = (await response.json()) as AuditResult;

          setResult(data);
          setStatus("success");
          setLoadingStage(null);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred"
          );
          setStatus("error");
          setLoadingStage(null);
        }
      })();
    },
    []
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setLoadingStage(null);
  }, []);

  return { status, result, error, loadingStage, runAudit, reset };
}
