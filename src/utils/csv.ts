export function parseCsvSimple(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const split = (line: string) => line.split(",").map((s) => s.trim());
  const headers = split(lines[0]);
  const rows = lines.slice(1).map(split);

  return { headers, rows };
}
