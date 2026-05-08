import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { validateUrl } from "./utils/validateUrl.js";
import { fetchPage } from "./utils/fetchPage.js";
import { TTLCache } from "./utils/cache.js";
import { extractCTAs } from "./extractors/extractCTAs.js";
import { extractTrustSignals } from "./extractors/extractTrustSignals.js";
import { extractFormFields } from "./extractors/extractFormFields.js";
import { extractHeadlines } from "./extractors/extractHeadlines.js";
import { analyzeWithAI } from "./api/analyzeWithAI.js";
import type {
  AuditRequest,
  AuditResult,
  AuditErrorResponse,
  GoalType,
} from "./types.js";

const app = express();
const cache = new TTLCache<AuditResult>();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.post(
  "/api/audit",
  async (req: Request, res: Response): Promise<void> => {
    const { url, goalType } = req.body as Partial<AuditRequest>;

    if (!url || !goalType) {
      const err: AuditErrorResponse = {
        error: "Missing required fields",
        code: "invalid_url",
        message: "Both url and goalType are required",
      };
      res.status(422).json(err);
      return;
    }

    const validGoalTypes: GoalType[] = ["direct_booking", "lead_submission"];
    if (!validGoalTypes.includes(goalType as GoalType)) {
      const err: AuditErrorResponse = {
        error: "Invalid goalType",
        code: "invalid_url",
        message: "goalType must be direct_booking or lead_submission",
      };
      res.status(422).json(err);
      return;
    }

    const validation = validateUrl(url);
    if (!validation.valid) {
      const err: AuditErrorResponse = {
        error: "Invalid URL",
        code: "invalid_url",
        message: validation.reason ?? "URL is not allowed",
      };
      res.status(422).json(err);
      return;
    }

    const cacheKey = `${url}::${goalType}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const { html, screenshotBase64, finalUrl } = await fetchPage(url);

      const [ctas, trustSignals, formAnalysis, headlines] = await Promise.all([
        Promise.resolve(extractCTAs(html)),
        Promise.resolve(extractTrustSignals(html)),
        Promise.resolve(extractFormFields(html)),
        Promise.resolve(extractHeadlines(html)),
      ]);

      const signals = { ctas, trustSignals, formAnalysis, headlines };
      const aiOutput = await analyzeWithAI(signals, goalType as GoalType, finalUrl);

      const result: AuditResult = {
        url,
        finalUrl,
        goalType: goalType as GoalType,
        scannedAt: new Date().toISOString(),
        screenshotBase64,
        ...aiOutput,
      };

      cache.set(cacheKey, result);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("navigation")) {
        const errResp: AuditErrorResponse = {
          error: "Page fetch timed out",
          code: "timeout",
          message,
        };
        res.status(504).json(errResp);
        return;
      }

      if (message.toLowerCase().includes("ai") || message.toLowerCase().includes("anthropic")) {
        const errResp: AuditErrorResponse = {
          error: "AI analysis failed",
          code: "ai_error",
          message,
        };
        res.status(500).json(errResp);
        return;
      }

      const errResp: AuditErrorResponse = {
        error: "Fetch error",
        code: "fetch_error",
        message,
      };
      res.status(500).json(errResp);
    }
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const errResp: AuditErrorResponse = {
    error: "Internal server error",
    code: "ai_error",
    message: err.message,
  };
  res.status(500).json(errResp);
});

const PORT = parseInt(process.env.PORT ?? "3001", 10);
app.listen(PORT, () => {
  console.log(`CRO Auditor API listening on http://localhost:${PORT}`);
});
