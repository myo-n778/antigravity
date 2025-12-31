import { Compound } from '../types';
import { Category } from '../components/CategorySelector';
import { GAS_URLS } from '../config/dataSource';
import { parseCSV, csvToCompounds } from '../utils/csvParser';
import { parseReactionCSV, ReactionCSVRow } from '../utils/reactionParser';
import { compounds as defaultOrganicCompounds } from './compounds';

/**
 * GASから化合物データを取得
 */
export const loadCompoundsFromGAS = async (category: Category): Promise<Compound[]> => {
  const gasUrl = GAS_URLS[category];
  
  if (!gasUrl) {
    throw new Error(`GAS URL not configured for category: ${category}`);
  }

  try {
    // GASエンドポイントからデータを取得
    const response = await fetch(`${gasUrl}?type=compounds&category=${category}`, {
      method: 'GET',
      mode: 'cors', // CORS対応が必要
    });

    if (!response.ok) {
      throw new Error(`Failed to load compounds from GAS: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`[${category}] GAS response received`);
    
    // GASから返されるデータ形式に応じて処理
    if (data.csv) {
      // CSV形式で返される場合
      const csvRows = parseCSV(data.csv);
      console.log(`[${category}] Parsed ${csvRows.length} CSV rows from GAS`);
      const defaultCompounds = category === 'organic' ? defaultOrganicCompounds : [];
      const compounds = csvToCompounds(csvRows, defaultCompounds);
      console.log(`[${category}] Converted to ${compounds.length} compounds from GAS`);
      
      if (compounds.length === 0) {
        console.warn('No compounds found after conversion. Using default compounds.');
        return defaultCompounds;
      }
      
      return compounds;
    } else if (data.compounds) {
      // 既にパース済みの化合物データが返される場合
      return data.compounds as Compound[];
    } else if (data.error) {
      throw new Error(`GAS error: ${data.error}`);
    } else {
      throw new Error('Invalid data format from GAS. Expected "csv" or "compounds" field.');
    }
  } catch (error) {
    console.error(`Failed to load compounds from GAS for ${category}:`, error);
    // フォールバック: 有機化学の場合はデフォルトデータを返す
    if (category === 'organic') {
      console.warn('Falling back to default organic compounds');
      return defaultOrganicCompounds;
    }
    throw error;
  }
};

/**
 * GASから反応データを取得
 */
export const loadReactionsFromGAS = async (category: Category): Promise<ReactionCSVRow[]> => {
  const gasUrl = GAS_URLS[category];
  
  if (!gasUrl) {
    throw new Error(`GAS URL not configured for category: ${category}`);
  }

  try {
    const response = await fetch(`${gasUrl}?type=reactions&category=${category}`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to load reactions from GAS: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.csv) {
      // CSV形式で返される場合
      return parseReactionCSV(data.csv);
    } else if (data.reactions) {
      // 既にパース済みの反応データが返される場合
      return data.reactions as ReactionCSVRow[];
    } else {
      throw new Error('Invalid data format from GAS');
    }
  } catch (error) {
    console.error(`Failed to load reactions from GAS for ${category}:`, error);
    return [];
  }
};

