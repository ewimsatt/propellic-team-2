import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedSignals, GoalType, VisualAudit, FrictionMap, Recommendation } from "../types.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a senior CRO specialist with deep expertise in the travel industry. You analyze websites against proven conversion patterns from high-performing travel booking sites (Booking.com, Expedia, Airbnb, Viator, G Adventures).

You will receive extracted page signals and must return a structured JSON audit. Be specific and actionable. Reference travel industry benchmarks where relevant.

Signal evaluation criteria:
- CTAs: action verbs, urgency language, position above fold, button vs link treatment
- Trust signals: review counts >50 are meaningful; star ratings need accompanying count; security badges near payment CTAs add ~18% conversion lift
- Form fields: lead gen benchmark is 4-6 fields; full checkout benchmark is 7-12 fields; every extra field reduces conversion ~11%
- Headlines: value proposition must be clear within first viewport; vague headlines are a red flag
- Progress indicators: required for any form with 3+ steps

Scoring: visual_audit score and friction_map score are 0-100. Be strict — above 80 requires genuinely excellent implementation.

Return ONLY valid JSON. No prose, no markdown fences.`;

interface AIOutput {
  visualAudit: VisualAudit;
  frictionMap: FrictionMap;
  recommendations: Recommendation[];
}

export async function analyzeWithAI(
  signals: ExtractedSignals,
  goalType: GoalType,
  url: string
): Promise<AIOutput> {
  const userContent = JSON.stringify({ url, goalType, signals }, null, 2);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
    }

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Audit this page against travel industry CRO benchmarks:\n\n${userContent}`,
          },
        ],
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("");

      const parsed = JSON.parse(text) as AIOutput;

      if (!parsed.visualAudit || !parsed.frictionMap || !parsed.recommendations) {
        throw new Error("Incomplete JSON structure from AI");
      }

      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("AI analysis failed after 3 attempts");
}
