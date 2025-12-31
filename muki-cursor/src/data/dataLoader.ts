import { Compound } from '../types';
import { parseCSV, csvToCompounds, CompoundCSVRow } from '../utils/csvParser';
import { parseReactionCSV, ReactionCSVRow } from '../utils/reactionParser';
import { compounds as defaultOrganicCompounds } from './compounds';
import { Category } from '../components/CategorySelector';
import { DATA_SOURCE } from '../config/dataSource';
import { loadCompoundsFromGAS, loadReactionsFromGAS } from './gasLoader';

const compoundCache: Record<Category, Compound[] | null> = {
  organic: null,
  inorganic: null,
};

const reactionCache: Record<Category, ReactionCSVRow[] | null> = {
  organic: null,
  inorganic: null,
};

export const loadCompounds = async (category: Category): Promise<Compound[]> => {
  if (compoundCache[category]) {
    return compoundCache[category]!;
  }

  // データソースに応じて読み込み方法を切り替え
  if (DATA_SOURCE === 'gas') {
    try {
      const compounds = await loadCompoundsFromGAS(category);
      compoundCache[category] = compounds;
      return compounds;
    } catch (error) {
      console.warn(`Failed to load compounds from GAS for ${category}, falling back to CSV:`, error);
      // GASが失敗した場合はCSVにフォールバック
    }
  }

  // CSVファイルを読み込む（カテゴリごと）
  try {
    const response = await fetch(`/data/${category}/compounds.csv`);
    if (!response.ok) {
      throw new Error(`Failed to load ${category}/compounds.csv`);
    }
    
    const csvText = await response.text();
    const csvRows = parseCSV(csvText);
    // 有機化学の場合は既存のデフォルトデータを使用
    const defaultCompounds = category === 'organic' ? defaultOrganicCompounds : [];
    const compounds = csvToCompounds(csvRows, defaultCompounds);
    
    compoundCache[category] = compounds;
    return compounds;
  } catch (error) {
    console.warn(`Failed to load compounds from CSV for ${category}, using default data:`, error);
    // 有機化学の場合は既存のデフォルトデータを返す
    if (category === 'organic') {
      return defaultOrganicCompounds;
    }
    return [];
  }
};

export const loadReactions = async (category: Category): Promise<ReactionCSVRow[]> => {
  if (reactionCache[category]) {
    return reactionCache[category]!;
  }

  // データソースに応じて読み込み方法を切り替え
  if (DATA_SOURCE === 'gas') {
    try {
      const reactions = await loadReactionsFromGAS(category);
      reactionCache[category] = reactions;
      return reactions;
    } catch (error) {
      console.warn(`Failed to load reactions from GAS for ${category}, falling back to CSV:`, error);
      // GASが失敗した場合はCSVにフォールバック
    }
  }

  // CSVファイルを読み込む
  try {
    const response = await fetch(`/data/${category}/reactions.csv`);
    if (!response.ok) {
      throw new Error(`Failed to load ${category}/reactions.csv`);
    }
    
    const csvText = await response.text();
    const reactions = parseReactionCSV(csvText);
    
    reactionCache[category] = reactions;
    return reactions;
  } catch (error) {
    console.warn(`Failed to load reactions from CSV for ${category}:`, error);
    return [];
  }
};

