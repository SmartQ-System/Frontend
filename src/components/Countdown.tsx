import { useState, useEffect } from 'react';
import { playBeep } from '../utils/sound';

interface CountdownProps {
  onComplete: () => void;
  duration?: number;
}

export default function Countdown({ onComplete, duration = 3 }: CountdownProps) {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (count > 0) {
      playBeep(600, 0.1, 'sine'); // Tick: 600Hz
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      playBeep(1200, 0.3, 'square'); // Go: 1200Hz, distinct sound
      onComplete();
    }
  }, [count, onComplete]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="text-9xl font-bold text-white animate-bounce">
        {count}
      </div>
    </div>
  );
}
