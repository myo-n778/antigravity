import React from 'react';
import './CategorySelector.css';

export type Category = 'organic' | 'inorganic';

interface CategorySelectorProps {
  onSelectCategory: (category: Category) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelectCategory }) => {
  return (
    <div className="category-selector">
      <h1>化学クイズ</h1>

      <div className="category-grid">
        <button 
          className="category-button"
          onClick={() => onSelectCategory('organic')}
        >
          <div className="category-title">有機化学</div>

        </button>
        
        <button 
          className="category-button"
          onClick={() => onSelectCategory('inorganic')}
        >
          <div className="category-title">無機化学</div>

        </button>
      </div>
    </div>
  );
};

