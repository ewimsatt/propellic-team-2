import * as cheerio from "cheerio";
import type { FormField, FormAnalysis } from "../types.js";

const AUTOFILL_NAMES = new Set([
  "name",
  "email",
  "tel",
  "phone",
  "address",
  "city",
  "state",
  "zip",
  "postal",
  "country",
  "cc-name",
  "cc-number",
  "cc-exp",
  "cc-csc",
  "username",
  "password",
  "given-name",
  "family-name",
  "street-address",
]);

const AUTOFILL_AUTOCOMPLETE = new Set([
  "name",
  "given-name",
  "family-name",
  "email",
  "tel",
  "postal-code",
  "country",
  "address-line1",
  "address-line2",
  "cc-name",
  "cc-number",
  "cc-exp",
  "username",
  "new-password",
  "current-password",
]);

const EXCLUDED_TYPES = new Set(["hidden", "submit", "button", "reset", "image"]);

const INLINE_VALIDATION_PATTERNS = [
  '[class*="error"]',
  '[class*="invalid"]',
  '[class*="validation"]',
  "span.help",
  "p.error",
];

const PROGRESS_PATTERNS = [
  '[class*="progress"]',
  '[class*="step"]',
  '[class*="wizard"]',
  '[role="progressbar"]',
  'ol[class*="step"]',
];

export function extractFormFields(html: string): FormAnalysis {
  const $ = cheerio.load(html);
  const fields: FormField[] = [];

  const forms = $("form");
  const formCount = forms.length;

  let submitButtonText = "";
  let hasProgressIndicator = false;
  let hasInlineValidation = false;

  for (const sel of PROGRESS_PATTERNS) {
    if ($(sel).length > 0) {
      hasProgressIndicator = true;
      break;
    }
  }

  for (const sel of INLINE_VALIDATION_PATTERNS) {
    if ($(sel).length > 0) {
      hasInlineValidation = true;
      break;
    }
  }

  const submitBtn = $('button[type="submit"], input[type="submit"]').first();
  if (submitBtn.length) {
    submitButtonText = submitBtn.text().trim() || submitBtn.attr("value") || "Submit";
  }

  $("input, select, textarea").each((_, el) => {
    const $el = $(el);
    const type = ($el.attr("type") ?? "text").toLowerCase();

    if (EXCLUDED_TYPES.has(type)) return;

    const name = $el.attr("name") ?? $el.attr("id") ?? "";
    const required =
      $el.attr("required") !== undefined || $el.attr("aria-required") === "true";
    const hasPlaceholder = !!$el.attr("placeholder");

    const id = $el.attr("id");
    let hasLabel = false;
    let labelText = "";

    if (id) {
      const $label = $(`label[for="${id}"]`);
      if ($label.length) {
        hasLabel = true;
        labelText = $label.text().trim();
      }
    }

    if (!hasLabel) {
      const $parent = $el.closest("label");
      if ($parent.length) {
        hasLabel = true;
        labelText = $parent.text().replace($el.text(), "").trim();
      }
    }

    const autocomplete = $el.attr("autocomplete") ?? "";
    const nameAttr = ($el.attr("name") ?? "").toLowerCase();
    const idAttr = ($el.attr("id") ?? "").toLowerCase();

    const autofillFriendly =
      AUTOFILL_AUTOCOMPLETE.has(autocomplete) ||
      AUTOFILL_NAMES.has(nameAttr) ||
      AUTOFILL_NAMES.has(idAttr);

    fields.push({ name, type, required, hasLabel, hasPlaceholder, labelText, autofillFriendly });
  });

  return { fields, hasProgressIndicator, hasInlineValidation, submitButtonText, formCount };
}
