import { ChevronRight } from 'lucide-react';
import React from 'react';

const TextLink = ({
  url,
  value,
  className = '',
  isTargetBlank = false
}: {
  url: string;
  value: string;
  className?: string;
  isTargetBlank?: boolean;
}) => {
  return (
    <p className={`group flex items-center gap-1 text-primary ${className}`}>
      <a
        href={url}
        className="relative font-semibold"
        target={isTargetBlank ? '_blank' : '_self'}
      >
        {value}
        <span className="absolute bottom-0 left-[-2px] h-[1px] w-0 bg-primary transition-all duration-200 group-hover:w-full"></span>
      </a>
      <span className="transform transition-transform duration-200 group-hover:translate-x-1">
        <ChevronRight size={16} />
      </span>
    </p>
  );
};

export default TextLink;
