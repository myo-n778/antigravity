import React, { useState, useEffect, useMemo } from 'react';
import { Compound } from '../../types';
import { Category } from '../CategorySelector';
import { StructureViewer } from '../StructureViewer';
import { ScoreDisplay } from '../shared/ScoreDisplay';
import { ProgressBar } from '../shared/ProgressBar';
import { ResultMessage } from '../shared/ResultMessage';
import { getCompoundType, CompoundType } from '../../utils/compoundTypes';
import '../Quiz.css';

interface CompoundTypeQuizProps {
  compounds: Compound[];
  category: Category;
  onBack: () => void;
}

const allTypes: CompoundType[] = [
  'アルカン',
  'アルケン',
  'アルキン',
  'アルコール',
  'アルデヒド',
  'ケトン',
  'カルボン酸',
  'エーテル',
  '芳香族',
];

export const CompoundTypeQuiz: React.FC<CompoundTypeQuizProps> = ({ compounds, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const currentCompound = compounds[currentIndex];
  const correctType = getCompoundType(currentCompound.name);
  
  const options = useMemo(() => {
    const wrongTypes = allTypes
      .filter(type => type !== correctType)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [correctType, ...wrongTypes].sort(() => Math.random() - 0.5);
  }, [currentIndex, correctType]);

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    
    if (answer === correctType) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < compounds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalAnswered(0);
  };

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
  }, [currentIndex]);

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>
          有機化学クイズ　<span className="score-text"><ScoreDisplay score={score} totalAnswered={totalAnswered} /></span>
        </h1>
      </div>

      <ProgressBar current={currentIndex + 1} total={compounds.length} />

      <div className="quiz-content">
        <div className="structure-container">
          <h2>この化合物はどの種類？</h2>
          <StructureViewer structure={currentCompound.structure} compoundName={currentCompound.name} />
        </div>

        <div className="options-container">
          {options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === correctType;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <button
                key={option}
                className={`option-button ${
                  showCorrect ? 'correct' : ''
                } ${
                  showIncorrect ? 'incorrect' : ''
                } ${isSelected ? 'selected' : ''}`}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
              >
                {option}
                {showCorrect && <span className="result-icon">✓</span>}
                {showIncorrect && <span className="result-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {showResult && (
          <ResultMessage
            isCorrect={selectedAnswer === correctType}
            correctAnswer={correctType}
            onNext={handleNext}
            isLast={currentIndex >= compounds.length - 1}
          />
        )}
      </div>

      <div className="quiz-footer">
        <button className="back-button" onClick={onBack}>
          モード選択に戻る
        </button>
        <button className="reset-button" onClick={handleReset}>
          リセット
        </button>
      </div>
    </div>
  );
};

