import * as cheerio from "cheerio";
import type { CTASignal } from "../types.js";

const ACTION_VERBS = [
  "book",
  "reserve",
  "buy",
  "get",
  "start",
  "search",
  "find",
  "contact",
  "request",
  "plan",
  "explore",
  "discover",
  "check",
  "view",
  "learn",
  "sign up",
  "subscribe",
  "join",
  "try",
  "order",
  "download",
  "schedule",
  "claim",
  "apply",
];

const ABOVE_FOLD_SELECTORS = [
  "header",
  "nav",
  '[class*="hero"]',
  '[class*="banner"]',
  "section:first-of-type",
];

function isAboveFold($: cheerio.CheerioAPI, el: cheerio.Element): boolean {
  const $el = $(el);
  for (const sel of ABOVE_FOLD_SELECTORS) {
    if ($el.closest(sel).length > 0) return true;
  }
  return false;
}

function hasActionVerb(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return ACTION_VERBS.some((v) => lower.startsWith(v) || lower.includes(` ${v} `));
}

export function extractCTAs(html: string): CTASignal[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const results: CTASignal[] = [];

  const candidates = $('button, [role="button"], a').toArray();

  for (const el of candidates) {
    const $el = $(el);
    const text = $el.text().replace(/\s+/g, " ").trim();

    if (!text || !hasActionVerb(text)) continue;
    if (seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());

    const tagName = el.type === "tag" ? el.name : "unknown";
    const hasHref = tagName === "a" && !!$el.attr("href");
    const selector = buildSelector($el, tagName);

    results.push({
      text,
      selector,
      tagName,
      hasHref,
      isAboveFold: isAboveFold($, el),
    });
  }

  return results;
}

function buildSelector($el: cheerio.Cheerio<cheerio.Element>, tagName: string): string {
  const id = $el.attr("id");
  if (id) return `#${id}`;
  const cls = $el.attr("class")?.split(" ").filter(Boolean).slice(0, 2).join(".");
  if (cls) return `${tagName}.${cls}`;
  return tagName;
}
