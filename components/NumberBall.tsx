
import React from 'react';

interface NumberBallProps {
  number: number;
  type: 'red' | 'blue' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

const NumberBall: React.FC<NumberBallProps> = ({ number, type, size = 'md' }) => {
  const sizeClass = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl'
  }[size];

  const typeClass = {
    red: 'red-ball',
    blue: 'blue-ball',
    gold: 'gold-ball'
  }[type];

  return (
    <div className={`lotto-ball ${sizeClass} ${typeClass}`}>
      {number.toString().padStart(2, '0')}
    </div>
  );
};

export default NumberBall;
