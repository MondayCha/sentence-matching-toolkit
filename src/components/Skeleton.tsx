/**
 * https://flowbite.com/docs/components/skeleton/#default-skeleton
 */
import type { FC } from 'react';

const Skeleton: FC = () => {
  return (
    <div role="status" className="max-w-sm 2xl:max-w-3xl animate-pulse">
      <div className="h-4 bg-gray-200 rounded-full dark:bg-abyss-700 mb-4 w-48 2xl:w-96"></div>
      <div className="h-4 bg-gray-200 rounded-full dark:bg-abyss-700 mb-4 max-w-[360px] 2xl:max-w-[720px]"></div>
      <div className="h-4 bg-gray-200 rounded-full dark:bg-abyss-700 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded-full dark:bg-abyss-700 mb-4 max-w-[330px]  2xl:max-w-[660px]"></div>
      <div className="h-4 bg-gray-200 rounded-full dark:bg-abyss-700 mb-4 max-w-[300px]  2xl:max-w-[600px]"></div>
      <div className="h-4 bg-gray-200 rounded-full dark:bg-abyss-700 max-w-[360px]  2xl:max-w-[720px]"></div>
      <span className="sr-only">加载中...</span>
    </div>
  );
};

export default Skeleton;
