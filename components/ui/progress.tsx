import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  className?: string;
  variant?: 'default' | 'destructive';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-2 overflow-hidden rounded-full bg-primary/10',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-lg transition-all duration-300',
            variant === 'default'
              ? 'bg-gradient-to-r from-[#2c4eff] via-primary to-[#6a7dfc]'
              : 'bg-red-500'
          )}
          style={{ width: `${value < 0 ? 0 : value}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
