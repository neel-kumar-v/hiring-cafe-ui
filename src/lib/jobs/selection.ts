export function buildSharePayload(lines: Array<string | null | undefined>): string {
  const unique = new Set<string>();
  for (const line of lines) {
    const normalized = (line ?? "").trim();
    if (!normalized) continue;
    unique.add(normalized);
  }
  return Array.from(unique).join("\n");
}

export function selectRangeIds<T extends { id: string }>(ordered: T[], anchorId: string, targetId: string): string[] {
  const anchorIndex = ordered.findIndex((item) => item.id === anchorId);
  const targetIndex = ordered.findIndex((item) => item.id === targetId);
  if (anchorIndex === -1 || targetIndex === -1) return [targetId];
  const start = Math.min(anchorIndex, targetIndex);
  const end = Math.max(anchorIndex, targetIndex);
  return ordered.slice(start, end + 1).map((item) => item.id);
}
