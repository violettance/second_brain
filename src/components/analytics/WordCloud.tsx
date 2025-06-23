import React from 'react';

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
  
  return (
    <div className="h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4 overflow-hidden">
      <div className="h-full flex flex-wrap items-center justify-center gap-2">
        {words.map((word, index) => {
          const fontSize = Math.max(12, (word.frequency / maxFreq) * 32);
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
                textShadow: '0 0 10px rgba(0,0,0,0.5)'
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