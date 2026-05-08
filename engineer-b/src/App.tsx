import { useState } from "react";
import { useAudit } from "./hooks/useAudit.js";
import { InputScreen } from "./components/Input/InputScreen.js";
import { LoadingScreen } from "./components/Loading/LoadingScreen.js";
import { ReportScreen } from "./components/Report/ReportScreen.js";
import { ErrorScreen } from "./components/Report/ErrorScreen.js";
import type { AuditRequest } from "./types/audit.js";

export default function App() {
  const { status, result, error, loadingStage, runAudit, reset } = useAudit();
  const [lastUrl, setLastUrl] = useState("");

  function handleSubmit(req: AuditRequest) {
    setLastUrl(req.url);
    runAudit(req);
  }

  if (status === "idle") {
    return <InputScreen onSubmit={handleSubmit} />;
  }

  if (status === "loading" && loadingStage) {
    return <LoadingScreen url={lastUrl} loadingStage={loadingStage} />;
  }

  if (status === "success" && result) {
    return <ReportScreen result={result} onReset={reset} />;
  }

  if (status === "error") {
    return <ErrorScreen message={error ?? "Unknown error"} onReset={reset} />;
  }

  return null;
}
