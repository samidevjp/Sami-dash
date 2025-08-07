'use client';

import { useState, useLayoutEffect } from 'react';
import Image from 'next/image';

export default function Logo() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useLayoutEffect(() => {
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const logoSrc = isDarkMode ? '/WhiteLogo.png' : '/BlackLogo.png';

  return <Image src={logoSrc} alt="Logo" width={200} height={50} />;
}
