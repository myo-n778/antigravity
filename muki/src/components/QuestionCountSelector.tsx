import React, { useState } from 'react';
import './QuestionCountSelector.css';

export type QuestionCountMode = 'all' | 'batch-10';
export type OrderMode = 'sequential' | 'shuffle';
export interface QuizSettings {
  questionCountMode: QuestionCountMode;
  orderMode?: OrderMode;
  startIndex?: number;
}

interface QuestionCountSelectorProps {
  onSelectSettings: (settings: QuizSettings) => void;
  onBack: () => void;
}

export const QuestionCountSelector: React.FC<QuestionCountSelectorProps> = ({ onSelectSettings, onBack }) => {
  const [selectedMode, setSelectedMode] = useState<QuestionCountMode | null>(null);
  const [orderMode, setOrderMode] = useState<OrderMode | null>(null);
  const [startIndex, setStartIndex] = useState<number>(1);

  const handleModeSelect = (mode: QuestionCountMode) => {
    setSelectedMode(mode);
    if (mode === 'all') {
      // Allモードの場合は順番/シャッフル選択へ
      setOrderMode(null);
    } else {
      // 10ずつモードの場合は開始位置選択へ
      setStartIndex(1);
    }
  };

  const handleOrderSelect = (order: OrderMode) => {
    setOrderMode(order);
    onSelectSettings({
      questionCountMode: 'all',
      orderMode: order
    });
  };

  const handleStartIndexSelect = (index: number) => {
    setStartIndex(index);
    onSelectSettings({
      questionCountMode: 'batch-10',
      startIndex: index
    });
  };

  // モード選択画面
  if (!selectedMode) {
    return (
      <div className="question-count-selector">
        <div className="question-count-selector-header">
          <button className="back-button" onClick={onBack}>
            return
          </button>
          <h1>問題数を選択</h1>
        </div>
        <p className="question-count-description">出題する問題数を選択してください</p>
        <div className="question-count-grid">
          <button 
            className="question-count-button"
            onClick={() => handleModeSelect('all')}
          >
            <div className="question-count-title">All</div>
            <div className="question-count-subtitle">全ての問題を出題</div>
          </button>
          
          <button 
            className="question-count-button"
            onClick={() => handleModeSelect('batch-10')}
          >
            <div className="question-count-title">10ずつ</div>
            <div className="question-count-subtitle">10問ずつ出題</div>
          </button>
        </div>
      </div>
    );
  }

  // Allモード: 順番/シャッフル選択
  if (selectedMode === 'all' && !orderMode) {
    return (
      <div className="question-count-selector">
        <div className="question-count-selector-header">
          <button className="back-button" onClick={() => setSelectedMode(null)}>
            return
          </button>
          <h1>出題順序を選択</h1>
        </div>
        <p className="question-count-description">問題の出題順序を選択してください</p>
        <div className="question-count-grid">
          <button 
            className="question-count-button"
            onClick={() => handleOrderSelect('sequential')}
          >
            <div className="question-count-title">順番通り</div>
            <div className="question-count-subtitle">元の順番で出題</div>
          </button>
          
          <button 
            className="question-count-button"
            onClick={() => handleOrderSelect('shuffle')}
          >
            <div className="question-count-title">シャッフル</div>
            <div className="question-count-subtitle">ランダムな順番で出題</div>
          </button>
        </div>
      </div>
    );
  }

  // 10ずつモード: 開始位置選択
  if (selectedMode === 'batch-10') {
    return (
      <div className="question-count-selector">
        <div className="question-count-selector-header">
          <button className="back-button" onClick={() => setSelectedMode(null)}>
            return
          </button>
          <h1>開始位置を選択</h1>
        </div>
        <p className="question-count-description">何番から始めるか選択してください（10問ずつ）</p>
        <div className="start-index-grid">
          {[1, 11, 21, 31, 41, 51, 61, 71, 81, 91].map(index => (
            <button
              key={index}
              className={`start-index-button ${startIndex === index ? 'selected' : ''}`}
              onClick={() => handleStartIndexSelect(index)}
            >
              {index}番から
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

