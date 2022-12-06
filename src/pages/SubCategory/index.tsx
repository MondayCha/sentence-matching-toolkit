import type { FC } from 'react';
import log from '@/middleware/logger';
import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import IconPending from '@/assets/Pending';
import { useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { getSourceFilename, getSubCategory } from '@/middleware/store';
import IconSearch from '@/assets/search';
import SubCategoryButtonGroup, { SubListIndex } from './SubCategoryButtonGroup';
import CategoryWindow from '../Category/CategoryWindow';
import { SourceRecord } from '@/api/core';
import { WindowProps } from '../Category';
import SubCategoryWindow from './SubCategoryWindow';

const SubCategory: FC = () => {
  const sourceBaseName = useRecoilValue(getSourceFilename);
  const subCategoryLoadable = useRecoilValueLoadable(getSubCategory);
  const [listIndex, setListIndex] = useState(SubListIndex.Normal);
  const [normalList, setNormalList] = useState<SourceRecord[]>([]);
  const [incompleteList, setIncompleteList] = useState<SourceRecord[]>([]);
  const [suspensionList, setSuspensionList] = useState<SourceRecord[]>([]);
  const [mismatchList, setMismatchList] = useState<SourceRecord[]>([]);
  const [recycledList, setRecycledList] = useState<SourceRecord[]>([]);

  useEffect(() => {
    if (subCategoryLoadable.state === 'hasValue' && subCategoryLoadable.contents !== undefined) {
      setNormalList(subCategoryLoadable.contents.normalRecords);
      setSuspensionList(subCategoryLoadable.contents.suspensionRecords);
      setIncompleteList(subCategoryLoadable.contents.incompleteRecords);
      setMismatchList(subCategoryLoadable.contents.mismatchRecords);
    }
  }, [subCategoryLoadable]);

  const windowProps: WindowProps = useMemo(() => {
    switch (listIndex) {
      case SubListIndex.Normal:
        return {
          displayList: normalList,
          actionTag: '移除',
          actionHandler: (index) => {},
        };
      case SubListIndex.Incomplete:
        return {
          displayList: incompleteList,
          actionTag: '添加',
          actionHandler: (index) => {},
        };
      case SubListIndex.Suspension:
        return {
          displayList: suspensionList,
          actionTag: '添加',
          actionHandler: (index) => {},
        };
      case SubListIndex.Mismatch:
        return {
          displayList: mismatchList,
          actionTag: '添加',
          actionHandler: (index) => {},
        };
      case SubListIndex.Recycled:
        return {
          displayList: recycledList,
          actionTag: '撤销',
          actionHandler: (index) => {},
        };
      default:
        return {
          displayList: [],
          actionTag: '',
          actionHandler: () => {},
        };
    }
  }, [listIndex, normalList, suspensionList, mismatchList, recycledList]);

  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">班级匹配</h1>
        <p className="mdc-text-sm">基于 N-Gram 算法模糊搜索，评分并匹配给定班级。</p>
      </div>
      {subCategoryLoadable.state === 'hasValue' ? (
        <div className="flex flex-col items-end w-full h-full space-y-4">
          <SubCategoryButtonGroup subListIndex={listIndex} setSubListIndex={setListIndex} />
          <SubCategoryWindow
            records={windowProps.displayList}
            actionTag={windowProps.actionTag}
            actionHandler={windowProps.actionHandler}
          />
          <button className="mdc-btn-primary p-1 w-32 mr-12 lg:mr-14">
            <div className="flex flex-row items-center justify-center space-x-2">提交</div>
          </button>
        </div>
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
