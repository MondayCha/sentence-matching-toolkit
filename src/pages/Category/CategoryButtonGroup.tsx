import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';

export const enum ListIndex {
  Certainty = 0,
  Probably,
  Possibility,
  Improbability,
  Recycled,
}

const CategoryButtonGroup: FC<{
  showInDict: boolean;
  listIndex: ListIndex;
  setListIndex: React.Dispatch<React.SetStateAction<ListIndex>>;
}> = ({ showInDict, listIndex, setListIndex }) => {
  const getButtonStyle = (matchIndex: ListIndex): string =>
    clsx(
      'py-1 px-6 mdc-text-sm text-abyss-900 bg-white rounded-full border border-zinc-200 hover:bg-abyss-100 hover:text-blue-700 dark:bg-abyss-750',
      {
        'dark:border-sky-500 dark:text-sky-500 dark:hover:border-sky-500 dark:hover:bg-abyss-750 dark:hover:text-sky-500 dark:hover:cursor-default':
          listIndex === matchIndex,

        '  dark:text-zinc-200 dark:border-abyss-500 dark:hover:text-white dark:hover:bg-abyss-700':
          listIndex !== matchIndex,
      }
    );

  return (
    <div className="flex flex-row w-full px-4 2xl:px-6 space-x-1.5">
      <button
        type="button"
        className={getButtonStyle(ListIndex.Certainty)}
        onClick={() => {
          setListIndex(ListIndex.Certainty);
        }}
      >
        极大
      </button>
      {showInDict && (
        <button
          type="button"
          className={getButtonStyle(ListIndex.Probably)}
          onClick={() => {
            setListIndex(ListIndex.Probably);
          }}
        >
          一定
        </button>
      )}
      <button
        type="button"
        className={getButtonStyle(ListIndex.Possibility)}
        onClick={() => {
          setListIndex(ListIndex.Possibility);
        }}
      >
        较小
      </button>
      <button
        type="button"
        className={getButtonStyle(ListIndex.Improbability)}
        onClick={() => {
          setListIndex(ListIndex.Improbability);
        }}
      >
        极小
      </button>
      <button
        type="button"
        className={getButtonStyle(ListIndex.Recycled)}
        onClick={() => {
          setListIndex(ListIndex.Recycled);
        }}
      >
        回收站
      </button>
    </div>
  );
};

export default CategoryButtonGroup;
