import * as cheerio from "cheerio";
import type { HeadlineSignals } from "../types.js";

export function extractHeadlines(html: string): HeadlineSignals {
  const $ = cheerio.load(html);

  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();

  const h2s: string[] = [];
  $("h2").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) h2s.push(text);
  });

  const metaTitle = $('meta[name="title"]').attr("content") ?? $("title").text().trim() ?? "";
  const metaDescription = $('meta[name="description"]').attr("content") ?? "";
  const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";

  let heroText = "";
  const heroSelectors = ['[class*="hero"]', '[class*="banner"]', "section:first-of-type"];
  for (const sel of heroSelectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.find("h1, h2, h3, p").first().text().replace(/\s+/g, " ").trim();
      if (text && text !== h1) {
        heroText = text;
        break;
      }
    }
  }

  return { h1, h2s: h2s.slice(0, 10), metaTitle, metaDescription, ogTitle, heroText };
}
