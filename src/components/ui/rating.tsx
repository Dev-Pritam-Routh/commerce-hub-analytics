import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (newValue: number) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className={cn(
            'text-yellow-400 transition-colors',
            readOnly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-500'
          )}
          disabled={readOnly}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= value ? 'fill-current' : 'fill-none'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export { Rating }; 