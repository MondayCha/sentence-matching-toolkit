/**
 * suspense fallback component
 */
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import clsx from 'clsx';
import { FileAddition } from '@icon-park/react';

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
        'hover:bg-abyss-800 select-none',
        {
          'bg-abyss-750 border border-abyss-700  after:block after:absolute after:left-0 after:rounded after:bg-sky-500 after:h-7 after:w-1 after:-translate-x-1/2':
            index === currentIndex,
        }
      )}
      onClick={() => setCurrentIndex(index)}
    >
      {/* TODO: currently no animation */}
      <div className={iconClassName}>{currentIndex === index ? activeIcon : normalIcon}</div>
      {currentIndex !== index && <p className=" text-xs text-white">{text}</p>}
    </button>
  );
};

export default NavButton;
