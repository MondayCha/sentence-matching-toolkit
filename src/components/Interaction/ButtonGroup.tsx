import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';

export interface ButtonInfo<T> {
  name: string;
  index: T;
}

function ButtonGroup<T>(props: {
  infoList: ButtonInfo<T>[];
  currentIndex: T;
  setCurrentIndex: React.Dispatch<React.SetStateAction<T>>;
}) {
  const getButtonStyle = (matchIndex: T): string =>
    clsx(
      'h-8 px-5 lg:px-6 mdc-text-sm bg-haruki-100 dark:bg-abyss-750 rounded-full border leading-none transition-colors duration-200 ease-in-out',
      {
        'border-primary-light-400 text-primary-light-400 dark:border-primary-dark-400 dark:text-primary-dark-400 hover:cursor-default':
          props.currentIndex === matchIndex,
        'dark:text-zinc-200 dark:border-abyss-500 dark:hover:text-white dark:hover:bg-abyss-700 text-abyss-900 border-zinc-300 hover:text-black hover:bg-haruki-50':
          props.currentIndex !== matchIndex,
      }
    );

  const ButtonOne = (info: ButtonInfo<T>) => (
    <button
      type="button"
      className={getButtonStyle(info.index)}
      onClick={() => {
        props.setCurrentIndex(info.index);
      }}
    >
      {info.name}
    </button>
  );

  return (
    <div className="flex flex-row w-full px-4 2xl:px-6 space-x-1.5">
      {props.infoList.map((info) => (
        <ButtonOne {...info} />
      ))}
    </div>
  );
}

export default ButtonGroup;
