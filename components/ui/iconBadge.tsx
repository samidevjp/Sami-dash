import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface IconBadgeProps {
  icon?: LucideIcon;
  className?: string;
  size?: number;
}

const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  className,
  size = 12
}) => {
  return (
    <div
      className={cn(
        'flex h-5 w-5 items-center justify-center rounded-sm bg-background text-muted-foreground',
        className
      )}
    >
      <Image src="/logoCircle.png" alt="logo" width={10} height={10} />
      {/* {Icon ? (
        <Icon size={size} className="" />
      ) : (
        <Image src="/logoCircle.png" alt="logo" width={10} height={10} />
      )} */}
    </div>
  );
};

export default IconBadge;
