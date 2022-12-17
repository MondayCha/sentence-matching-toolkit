/**
 * suspense fallback component
 */
import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';

const NavButton: FC<{
  index: number;
  currentIndex: number;
  normalIcon: ReactNode;
  activeIcon: ReactNode;
  text: string;
  iconClassName?: string;
  setCurrentIndex: (index: number) => void;
}> = ({ index, currentIndex, normalIcon, activeIcon, text, iconClassName, setCurrentIndex }) => {
  return (
    <button
      className={clsx(
        'w-15 h-15 flex flex-col items-center justify-center gap-1.5 rounded p-2 relative',
        'hover:bg-haruki-100 dark:hover:bg-abyss-800 select-none',
        'after:block after:absolute after:left-0 after:rounded after:bg-primary-light-400 dark:after:bg-primary-dark-400 after:h-6 after:w-1 after:-translate-x-1/2 after:opacity-0 after:transition-opacity after:duration-300',
        {
          'bg-haruki-50 dark:bg-abyss-750 border dark:border-abyss-700 after:opacity-100':
            index === currentIndex,
        }
      )}
      onClick={() => setCurrentIndex(index)}
    >
      {/* TODO: currently no animation */}
      <motion.div layout className={iconClassName}>
        {currentIndex === index ? activeIcon : normalIcon}
      </motion.div>
      {currentIndex !== index && <p className=" text-xs dark:text-white text-abyss-600">{text}</p>}
    </button>
  );
};

export default NavButton;
