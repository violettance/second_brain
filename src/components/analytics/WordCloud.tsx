import React from 'react';
import { resolveDesignNumber } from '../../design/tokens';

interface WordData {
  word: string;
  frequency: number;
  color: string;
}

interface WordCloudProps {
  words: WordData[];
}

export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const maxFreq = Math.max(...words.map(w => w.frequency));
  const minFontSize = resolveDesignNumber('--word-cloud-min-font-size');
  const maxFontSize = resolveDesignNumber('--word-cloud-max-font-size');
  
  return (
    <div className="h-64 bg-canvas rounded-lg border border-ink p-4 overflow-hidden">
      <div className="h-full flex flex-wrap items-center justify-center gap-2">
        {words.map((word, index) => {
          const fontSize = Math.max(minFontSize, (word.frequency / maxFreq) * maxFontSize);
          const positions = [
            'rotate-0', 'rotate-12', '-rotate-12', 'rotate-6', '-rotate-6'
          ];
          const rotation = positions[index % positions.length];
          
          return (
            <span
              key={word.word}
              className={`font-bold cursor-pointer hover:scale-110 transition-transform duration-200 ${rotation}`}
              style={{
                fontSize: `${fontSize}px`,
                color: word.color,
                textShadow: 'var(--shadow-text)'
              }}
              title={`${word.word}: used ${word.frequency} times`}
            >
              {word.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
