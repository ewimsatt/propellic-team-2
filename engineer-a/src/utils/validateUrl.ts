const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

const PRIVATE_RANGES = [
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
];

export function validateUrl(raw: string): { valid: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { valid: false, reason: "URL could not be parsed" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, reason: "Only http and https protocols are allowed" };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, reason: "Blocked hostname" };
  }

  for (const pattern of PRIVATE_RANGES) {
    if (pattern.test(hostname)) {
      return { valid: false, reason: "Private IP range is not allowed" };
    }
  }

  return { valid: true };
}
