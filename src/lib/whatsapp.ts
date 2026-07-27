/**
 * Build a wa.me deep link. Number may be stored with spaces/plus; strip to
 * digits. Message is URL-encoded. Used by the quote flow (spec §10) and CTAs.
 */
export function whatsappUrl(number: string | null | undefined, message: string): string {
  const digits = (number ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
