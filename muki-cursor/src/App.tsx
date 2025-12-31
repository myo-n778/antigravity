import React, { useState, useEffect } from 'react';
import { Quiz } from './components/Quiz';
import { ModeSelector, QuizMode } from './components/ModeSelector';
import { CategorySelector, Category } from './components/CategorySelector';
import { QuestionCountSelector } from './components/QuestionCountSelector';
import { loadCompounds } from './data/dataLoader';
import { Compound } from './types';
import './App.css';

export type QuestionCountMode = 'all' | 'batch-10';
export type OrderMode = 'sequential' | 'shuffle';
export interface QuizSettings {
  questionCountMode: QuestionCountMode;
  orderMode?: OrderMode; // Allモードの場合のみ
  startIndex?: number; // 10ずつモードの場合のみ（1-indexed）
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory && selectedMode && quizSettings) {
      setLoading(true);
      loadCompounds(selectedCategory)
        .then(data => {
          console.log(`[${selectedCategory}] 読み込まれた化合物の総数:`, data.length);
          
          // 構造式が空の化合物をフィルタリング
          let validCompounds = data.filter(c => 
            c.structure && 
            c.structure.atoms && 
            c.structure.atoms.length > 0 &&
            c.structure.bonds && 
            c.structure.bonds.length > 0
          );
          
          // 問題数モードに応じてフィルタリング
          if (quizSettings.questionCountMode === 'batch-10') {
            // 10問ずつ: 開始位置から10問を選択
            const startIdx = (quizSettings.startIndex || 1) - 1; // 0-indexedに変換
            validCompounds = validCompounds.slice(startIdx, startIdx + 10);
          }
          // 'all'の場合は全て使用
          
          // 順番モードに応じてソート
          if (quizSettings.orderMode === 'shuffle') {
            validCompounds = validCompounds.sort(() => Math.random() - 0.5);
          }
          // 'sequential'の場合はそのまま（元の順番）
          
          console.log(`[${selectedCategory}] 有効な化合物の数:`, validCompounds.length);
          
          if (validCompounds.length === 0) {
            console.error('No valid compounds found. Data:', data);
            console.error('Total compounds loaded:', data.length);
            const invalidCompounds = data.filter(c => 
              !c.structure || 
              !c.structure.atoms || 
              c.structure.atoms.length === 0 ||
              !c.structure.bonds || 
              c.structure.bonds.length === 0
            );
            console.error('Compounds with invalid structure:', invalidCompounds.length);
            console.error('Invalid compound names:', invalidCompounds.map(c => c.name));
          }
          
          setCompounds(validCompounds);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to load compounds:', error);
          setCompounds([]);
          setLoading(false);
        });
    }
  }, [selectedCategory, selectedMode, quizSettings]);

  if (!selectedCategory) {
    return (
      <div className="App">
        <CategorySelector onSelectCategory={setSelectedCategory} />
      </div>
    );
  }

  if (!selectedMode) {
    return (
      <div className="App">
        <ModeSelector 
          category={selectedCategory}
          onSelectMode={setSelectedMode}
          onBack={() => setSelectedCategory(null)}
        />
      </div>
    );
  }

  if (!quizSettings) {
    return (
      <div className="App">
        <QuestionCountSelector
          onSelectSettings={setQuizSettings}
          onBack={() => setSelectedMode(null)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="App">
        <div style={{ textAlign: 'center', color: '#ffffff', padding: '40px' }}>
          データを読み込んでいます...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Quiz 
        compounds={compounds} 
        mode={selectedMode}
        category={selectedCategory}
        onBack={() => setQuizSettings(null)}
      />
    </div>
  );
}

export default App;

