'use client';
import React from 'react';
import { useInView } from 'react-intersection-observer';

type Props = {
  variant?: 'default' | 'bottom';
  children: React.ReactNode;
};

export const FadeInBottom: React.FC<Props> = ({
  variant = 'default',
  children
}) => {
  const inviewSetup: any = {
    triggerOnce: true
  };
  if (variant === 'default') {
    inviewSetup['threshold'] = 0.2;
  } else if (variant === 'bottom') {
    inviewSetup['rootMargin'] = '-40px';
  }
  const { ref, inView } = useInView(inviewSetup);

  const fadeInClassName = inView
    ? variant === 'bottom'
      ? 'animate-fadeInBottom ease-in-out'
      : 'opacity-1 ease-in-out'
    : 'opacity-0 ease-in-out';

  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const className = [
        child.props.className,
        fadeInClassName,
        'transition-opacity duration-1000 ease-in-out'
      ]
        .filter((el) => el)
        .join(' ');

      return React.cloneElement(child as React.ReactElement, {
        ref,
        className
      });
    } else {
      return child;
    }
  });

  return <>{wrappedChildren}</>;
};
