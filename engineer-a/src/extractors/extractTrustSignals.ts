import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import type { TrustSignal } from "../types.js";

type TrustSignalType = TrustSignal["type"];

interface TrustPattern {
  type: TrustSignalType;
  selectors: string[];
  textPatterns: RegExp[];
}

const PATTERNS: TrustPattern[] = [
  {
    type: "star_rating",
    selectors: ['[class*="star"]', '[class*="rating"]', '[aria-label*="star"]'],
    textPatterns: [/★|☆|⭐/, /\d(\.\d)?\s*\/\s*5/, /rated\s+\d/i],
  },
  {
    type: "review_count",
    selectors: ['[class*="review"]', '[class*="rating-count"]'],
    textPatterns: [/\d[\d,]+\s*(reviews?|ratings?)/i, /based on \d/i],
  },
  {
    type: "security_badge",
    selectors: [
      '[class*="secure"]',
      '[class*="ssl"]',
      '[class*="trust"]',
      '[class*="badge"]',
      'img[alt*="secure" i]',
      'img[alt*="ssl" i]',
      'img[alt*="mcafee" i]',
      'img[alt*="norton" i]',
      'img[alt*="verisign" i]',
    ],
    textPatterns: [/secure checkout/i, /ssl\s*encrypted/i, /256.bit/i, /safe\s*&\s*secure/i],
  },
  {
    type: "partner_logo",
    selectors: [
      '[class*="partner"]',
      '[class*="sponsor"]',
      '[class*="logo"]',
      'img[alt*="partner" i]',
    ],
    textPatterns: [/our partners/i, /trusted by/i, /as seen in/i],
  },
  {
    type: "social_proof_copy",
    selectors: ['[class*="social-proof"]', '[class*="testimonial"]', '[class*="proof"]'],
    textPatterns: [
      /\d[\d,]+\s*(happy|satisfied|travelers?|customers?|guests?)/i,
      /join\s+\d[\d,]+/i,
      /loved by\s+\d/i,
    ],
  },
  {
    type: "guarantee",
    selectors: ['[class*="guarantee"]', '[class*="refund"]', '[class*="money-back"]'],
    textPatterns: [/money.back guarantee/i, /best price guarantee/i, /free cancellation/i, /no hidden fees/i],
  },
  {
    type: "award",
    selectors: ['[class*="award"]', '[class*="winner"]', 'img[alt*="award" i]'],
    textPatterns: [/award.winning/i, /best\s+of\s+\d{4}/i, /winner/i],
  },
  {
    type: "review_platform",
    selectors: [
      'img[alt*="tripadvisor" i]',
      'img[alt*="trustpilot" i]',
      '[class*="tripadvisor"]',
      '[class*="trustpilot"]',
      '[class*="google-review"]',
    ],
    textPatterns: [/tripadvisor/i, /trustpilot/i, /google reviews/i],
  },
];

export function extractTrustSignals(html: string): TrustSignal[] {
  const $ = cheerio.load(html);
  const results: TrustSignal[] = [];

  for (const pattern of PATTERNS) {
    const matched = new Set<string>();

    for (const sel of pattern.selectors) {
      try {
        $(sel).each((_, el) => {
          const $el = $(el);
          const text = $el.text().replace(/\s+/g, " ").trim();
          const key = `${sel}::${text.slice(0, 50)}`;
          if (matched.has(key)) return;
          matched.add(key);

          const value = extractValue(text, pattern.type);
          results.push({ type: pattern.type, selector: sel, text: text.slice(0, 200), value });
        });
      } catch {
        // malformed selector — skip
      }
    }

    $("body *").each((_, el) => {
      const $el = $(el);
      const text = $el.text().replace(/\s+/g, " ").trim();
      if (!text) return;

      for (const re of pattern.textPatterns) {
        if (re.test(text)) {
          const selector = buildSelector($el, el);
          const key = `text::${pattern.type}::${text.slice(0, 50)}`;
          if (matched.has(key)) return;
          matched.add(key);
          const value = extractValue(text, pattern.type);
          results.push({ type: pattern.type, selector, text: text.slice(0, 200), value });
          break;
        }
      }
    });
  }

  return results.slice(0, 50);
}

function extractValue(text: string, type: TrustSignalType): string | undefined {
  if (type === "star_rating") {
    const m = text.match(/(\d(\.\d)?)\s*\/\s*5/) ?? text.match(/(\d(\.\d)?)\s*stars?/i);
    return m ? m[1] : undefined;
  }
  if (type === "review_count") {
    const m = text.match(/([\d,]+)\s*(reviews?|ratings?)/i);
    return m ? m[1].replace(/,/g, "") : undefined;
  }
  return undefined;
}

function buildSelector(
  $el: cheerio.Cheerio<Element>,
  el: Element
): string {
  const id = $el.attr("id");
  if (id) return `#${id}`;
  const tagName = el.type === "tag" ? el.name : "div";
  const cls = $el.attr("class")?.split(" ").filter(Boolean).slice(0, 2).join(".");
  if (cls) return `${tagName}.${cls}`;
  return tagName;
}
