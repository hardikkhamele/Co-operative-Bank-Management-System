import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Modern Slim Top Progress Bar for page and route transitions.
 */
const TopProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start progress on location change
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 250);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[10000] h-[3px] bg-transparent pointer-events-none"
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#225091] via-blue-400 to-teal-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(34,80,145,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
};

export default TopProgressBar;
