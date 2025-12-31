import React, { useState, useEffect, useMemo } from 'react';
import { Compound } from '../../types';
import { Category } from '../CategorySelector';
import { StructureViewer } from '../StructureViewer';
import { ScoreDisplay } from '../shared/ScoreDisplay';
import { ProgressBar } from '../shared/ProgressBar';
import { ResultMessage } from '../shared/ResultMessage';
import '../Quiz.css';

interface NameToStructureQuizProps {
  compounds: Compound[];
  category: Category;
  onBack: () => void;
}

export const NameToStructureQuiz: React.FC<NameToStructureQuizProps> = ({ compounds, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const currentCompound = compounds[currentIndex];
  
  // 選択肢として構造式を表示（正解を含む4つの構造式）
  const options = useMemo(() => {
    const wrongCompounds = compounds
      .filter(c => c.id !== currentCompound.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [currentCompound, ...wrongCompounds].sort(() => Math.random() - 0.5);
  }, [currentIndex, compounds, currentCompound.id]);

  const handleAnswer = (answerId: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answerId);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    
    if (answerId === currentCompound.id) {
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
          <h2>「{currentCompound.name}」の構造式は？</h2>
        </div>

        <div className="options-container-structure">
          {options.map((compound) => {
            const isSelected = selectedAnswer === compound.id;
            const isCorrect = compound.id === currentCompound.id;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <button
                key={compound.id}
                className={`option-button-structure ${
                  showCorrect ? 'correct' : ''
                } ${
                  showIncorrect ? 'incorrect' : ''
                } ${isSelected ? 'selected' : ''}`}
                onClick={() => handleAnswer(compound.id)}
                disabled={showResult}
              >
                <StructureViewer 
                  structure={compound.structure} 
                  compoundName={compound.name}
                />
                {showCorrect && <span className="result-icon">✓</span>}
                {showIncorrect && <span className="result-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {showResult && (
          <ResultMessage
            isCorrect={selectedAnswer === currentCompound.id}
            correctAnswer={currentCompound.name}
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

