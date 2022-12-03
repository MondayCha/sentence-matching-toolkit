import type { FC } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import IconPending from '@/assets/Pending';
import { useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { getSourceFilename, getSubCategory } from '@/middleware/store';
import IconSearch from '@/assets/search';

const SubCategory: FC = () => {
  const sourceBaseName = useRecoilValue(getSourceFilename);
  const subCategoryLoading = useRecoilValueLoadable(getSubCategory);

  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">班级匹配</h1>
        <p className="mdc-text-sm">基于 Jieba 分词和字符相似度算法，评分并匹配给定班级。</p>
      </div>
      {subCategoryLoading.state === 'hasValue' ? (
        <></>
      ) : (
        <>
          {!!sourceBaseName ? (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
                  <IconSearch />
                  <p className="mdc-text-sm text-center">正在匹配</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
                  <IconPending />
                  <p className="mdc-text-sm text-center">应用空闲，可在「设置」修改班级信息</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubCategory;
