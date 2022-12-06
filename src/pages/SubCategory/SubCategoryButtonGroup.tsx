import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';

export const enum SubListIndex {
  Normal = 0,
  Incomplete,
  Suspension,
  Mismatch,
  Recycled,
}

const SubCategoryButtonGroup: FC<{
  subListIndex: SubListIndex;
  setSubListIndex: React.Dispatch<React.SetStateAction<SubListIndex>>;
}> = ({ subListIndex, setSubListIndex }) => {
  const getButtonStyle = (matchIndex: SubListIndex): string =>
    clsx(
      'py-1 px-6 mdc-text-sm text-abyss-900 bg-white rounded-full border border-zinc-200 hover:bg-abyss-100 hover:text-blue-700 dark:bg-abyss-750',
      {
        'dark:border-sky-500 dark:text-sky-500 dark:hover:border-sky-500 dark:hover:bg-abyss-750 dark:hover:text-sky-500 dark:hover:cursor-default':
          subListIndex === matchIndex,

        '  dark:text-zinc-200 dark:border-abyss-500 dark:hover:text-white dark:hover:bg-abyss-700':
          subListIndex !== matchIndex,
      }
    );

  return (
    <div className="flex flex-row w-full px-4 2xl:px-6 space-x-1.5">
      <button
        type="button"
        className={getButtonStyle(SubListIndex.Normal)}
        onClick={() => {
          setSubListIndex(SubListIndex.Normal);
        }}
      >
        正常
      </button>
      <button
        type="button"
        className={getButtonStyle(SubListIndex.Incomplete)}
        onClick={() => {
          setSubListIndex(SubListIndex.Incomplete);
        }}
      >
        缺失
      </button>
      <button
        type="button"
        className={getButtonStyle(SubListIndex.Suspension)}
        onClick={() => {
          setSubListIndex(SubListIndex.Suspension);
        }}
      >
        异常
      </button>
      <button
        type="button"
        className={getButtonStyle(SubListIndex.Mismatch)}
        onClick={() => {
          setSubListIndex(SubListIndex.Mismatch);
        }}
      >
        无
      </button>
      <button
        type="button"
        className={getButtonStyle(SubListIndex.Recycled)}
        onClick={() => {
          setSubListIndex(SubListIndex.Recycled);
        }}
      >
        回收站
      </button>
    </div>
  );
};

export default SubCategoryButtonGroup;
