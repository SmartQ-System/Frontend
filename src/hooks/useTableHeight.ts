import { useState, useEffect, useRef } from 'react';

export function useTableHeight(rowHeight: number, headerHeight: number = 50, minRows: number = 5) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(minRows);

  useEffect(() => {
    const calculateLimit = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        const availableHeight = height - headerHeight;
        const calculated = Math.floor(availableHeight / rowHeight);
        setLimit(Math.max(minRows, calculated));
      }
    };

    // Calculate initially
    calculateLimit();

    // Calculate on resize
    const observer = new ResizeObserver(calculateLimit);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [rowHeight, headerHeight, minRows]);

  return { containerRef, limit };
}
