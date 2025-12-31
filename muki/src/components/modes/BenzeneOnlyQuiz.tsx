import React, { useMemo } from 'react';
import { Compound } from '../../types';
import { Category } from '../CategorySelector';
import { StructureToNameQuiz } from './StructureToNameQuiz';

interface BenzeneOnlyQuizProps {
  compounds: Compound[];
  category: Category;
  onBack: () => void;
}

export const BenzeneOnlyQuiz: React.FC<BenzeneOnlyQuizProps> = ({ compounds, category, onBack }) => {
  const benzeneCompounds = useMemo(() => {
    return compounds.filter(c => c.name === 'ベンゼン');
  }, [compounds]);

  return <StructureToNameQuiz compounds={benzeneCompounds} category={category} onBack={onBack} />;
};

