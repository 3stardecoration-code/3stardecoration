export async function onRequestError(err: unknown, request: unknown) {
  const { reportError } = await import("@/lib/observability/report-error");
  await reportError(err, { source: "onRequestError", request });
}
