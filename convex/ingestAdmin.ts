/** If INGEST_ADMIN_SECRET is set in Convex env, callers must pass a matching adminSecret; if unset, allow (local/dev). */
export function assertIngestAdminSecret(provided: string | undefined): void {
  const expected = process.env.INGEST_ADMIN_SECRET;
  if (expected && expected.length > 0 && provided !== expected) {
    throw new Error("Unauthorized ingest: invalid or missing admin secret");
  }
}
