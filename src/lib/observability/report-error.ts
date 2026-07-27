export type ErrorContext = Record<string, unknown>;
export interface ErrorAdapter {
  capture(error: unknown, context?: ErrorContext): void | Promise<void>;
}

// Default adapter: console. Swap for Sentry/Better Stack later (spec §18.9) — no call-site changes.
let adapter: ErrorAdapter = {
  capture(error, context) {
    console.error("[reportError]", error, context ?? {});
  },
};

export function __setAdapter(next: ErrorAdapter) {
  adapter = next;
}

export async function reportError(error: unknown, context?: ErrorContext): Promise<void> {
  await adapter.capture(error, context);
}
