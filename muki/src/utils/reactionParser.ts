export interface ReactionCSVRow {
  type: 'substitution' | 'synthesis';
  from: string;
  reagent: string;
  to: string;
  description: string;
}

export const parseReactionCSV = (csvText: string): ReactionCSVRow[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: ReactionCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row as ReactionCSVRow);
  }

  return rows;
};

