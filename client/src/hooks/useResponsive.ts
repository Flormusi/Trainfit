import { useState, useEffect } from 'react';

interface BreakpointValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
}

export const useResponsive = (): BreakpointValues => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width <= 480,
    isTablet: windowSize.width > 480 && windowSize.width <= 768,
    isDesktop: windowSize.width > 768 && windowSize.width <= 1024,
    isLargeDesktop: windowSize.width > 1024,
    width: windowSize.width,
  };
};