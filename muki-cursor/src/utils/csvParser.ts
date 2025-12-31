import { Compound } from '../types';

export interface CompoundCSVRow {
  id: string;
  name: string;
  type: string;
  formula: string;
  atoms?: string; // JSON形式の原子データ
  bonds?: string; // JSON形式の結合データ
}

export const parseCSV = (csvText: string): CompoundCSVRow[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: CompoundCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row as CompoundCSVRow);
  }

  return rows;
};

// CSV行を正しくパース（引用符で囲まれたフィールドを処理）
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // エスケープされた引用符
        current += '"';
        i++; // 次の引用符をスキップ
      } else {
        // 引用符の開始/終了
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // フィールドの区切り
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // 最後のフィールドを追加
  values.push(current.trim());
  
  return values;
}

export const csvToCompounds = (csvRows: CompoundCSVRow[], existingCompounds: Compound[]): Compound[] => {
  return csvRows
    .map(row => {
      // 既存の化合物データから構造式を取得（名前でマッチング）
      const existing = existingCompounds.find(c => c.name === row.name);
      
      if (existing) {
        return {
          ...existing,
          id: row.id,
          name: row.name,
        };
      }

      // 構造式データがJSON形式で提供されている場合
      if (row.atoms && row.bonds && row.atoms.trim() !== '' && row.bonds.trim() !== '') {
        try {
          // 引用符を除去（CSVから取得したデータが引用符で囲まれている場合）
          let atomsStr = row.atoms.trim();
          let bondsStr = row.bonds.trim();
          
          // 先頭と末尾の引用符を除去
          if (atomsStr.startsWith('"') && atomsStr.endsWith('"')) {
            atomsStr = atomsStr.slice(1, -1).replace(/""/g, '"');
          }
          if (bondsStr.startsWith('"') && bondsStr.endsWith('"')) {
            bondsStr = bondsStr.slice(1, -1).replace(/""/g, '"');
          }
          
          const atoms = JSON.parse(atomsStr);
          const bonds = JSON.parse(bondsStr);
          if (Array.isArray(atoms) && Array.isArray(bonds) && atoms.length > 0 && bonds.length > 0) {
            return {
              id: row.id,
              name: row.name,
              structure: {
                atoms,
                bonds,
              },
            };
          }
        } catch (e) {
          console.error(`Failed to parse structure for ${row.name}:`, e);
          console.error(`atoms value:`, row.atoms?.substring(0, 100));
          console.error(`bonds value:`, row.bonds?.substring(0, 100));
        }
      }

      // 構造式データがない場合は null を返す（後でフィルタリング）
      return null;
    })
    .filter((compound): compound is Compound => compound !== null);
};

