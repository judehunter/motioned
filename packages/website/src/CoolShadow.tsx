'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const CoolShadow = ({
  children,
  shadows,
  offset,
}: {
  children: ReactNode;
  shadows: string[];
  offset: number;
}) => {
  const commonStyles =
    'text-5xl lg:text-7xl [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000] absolute left-0 top-0';

  return (
    <div className="relative select-none font-lilita">
      <h1 aria-hidden className="opacity-0 text-5xl lg:text-7xl">
        {children}
      </h1>
      <h1
        className={`${commonStyles}`}
        style={{ zIndex: (shadows.length + 1) * 10 }}
      >
        {children}
      </h1>
      {shadows.map((shadow, i) => (
        <motion.h1
          key={i}
          className={`${shadow} ${commonStyles}`}
          aria-hidden
          style={{
            zIndex: shadows.length * 10 - i * 10,
          }}
          animate={{
            x: [0, -offset * (i + 1)],
            y: [0, -offset * (i + 1)],
          }}
          transition={{
            duration: 0.4,
          }}
        >
          {children}
        </motion.h1>
      ))}
    </div>
  );
};
