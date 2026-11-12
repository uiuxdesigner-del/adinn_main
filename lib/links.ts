/** Returns a normalised absolute http(s) URL, or null if missing/invalid. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function safeMailto(email: string | null | undefined): string | null {
  if (!email) return null;
  const value = email.trim();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)
    ? `mailto:${value}`
    : null;
}

export function safeTel(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return /^\+?\d{6,15}$/.test(digits) ? `tel:${digits}` : null;
}
