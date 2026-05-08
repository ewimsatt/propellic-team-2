export type GoalType = "direct_booking" | "lead_submission";
export type SignalStatus = "pass" | "warning" | "fail";
export type Priority = "high" | "medium" | "low";
export type Effort = "low" | "medium" | "high";

export interface AuditSignal {
  id: string;
  name: string;
  status: SignalStatus;
  detail: string;
  selector: string | null;
  benchmarkNote: string;
}

export interface VisualAudit {
  score: number;
  signals: AuditSignal[];
}

export interface FrictionItem {
  id: string;
  priority: Priority;
  title: string;
  description: string;
  affectedSelector: string | null;
}

export interface FrictionMap {
  score: number;
  formFieldCount: number;
  benchmarkFieldCount: number;
  items: FrictionItem[];
}

export interface Recommendation {
  id: string;
  priority: number;
  title: string;
  rationale: string;
  suggestedFix: string;
  goalRelevance: GoalType | "both";
  effort: Effort;
}

export interface AuditResult {
  url: string;
  finalUrl: string;
  goalType: GoalType;
  scannedAt: string;
  screenshotBase64: string | null;
  visualAudit: VisualAudit;
  frictionMap: FrictionMap;
  recommendations: Recommendation[];
}

export interface AuditRequest {
  url: string;
  goalType: GoalType;
}

export interface AuditErrorResponse {
  error: string;
  code: "invalid_url" | "timeout" | "ai_error" | "fetch_error";
  message: string;
}

export type AuditStatus = "idle" | "loading" | "success" | "error";

export type LoadingStage =
  | "Fetching page..."
  | "Analyzing signals..."
  | "Generating recommendations...";
