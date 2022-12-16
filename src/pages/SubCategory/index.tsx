import type { FC } from 'react';
import log from '@/middleware/logger';
import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import IconPending from '@/assets/illustrations/Pending';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import {
  appStatusState,
  getSubCategory,
  sourceFilePathState,
  subCategoryState,
} from '@/middleware/store';
import Searching from '@/assets/illustrations/Searching';
import SubCategoryButtonGroup, { SubListIndex } from './SubCategoryButtonGroup';
import CategoryWindow from '../Category/CategoryWindow';
import SubCategoryWindow from './SubCategoryWindow';
import { useThemeContext } from '@/components/theme';
import { AppStatus, BaseRecord, SubCategoryItem } from '@/api/core';

export interface SubWindowProps {
  displayList: SubCategoryItem[];
  actionTag: string;
  actionHandler: (id: number) => void;
}

const SubCategory: FC = () => {
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const { themeMode } = useThemeContext();
  const sourceFilePath = useRecoilValue(sourceFilePathState);
  const subCategoryLoadable = useRecoilValueLoadable(getSubCategory);
  const [subCategory, setSubCategory] = useRecoilState(subCategoryState);
  const [listIndex, setListIndex] = useState(SubListIndex.Normal);

  const [normalList, setNormalList] = useState<SubCategoryItem[]>([]);
  const [incompleteList, setIncompleteList] = useState<SubCategoryItem[]>([]);
  const [suspensionList, setSuspensionList] = useState<SubCategoryItem[]>([]);
  const [mismatchList, setMismatchList] = useState<SubCategoryItem[]>([]);
  const [recycledList, setRecycledList] = useState<SubCategoryItem[]>([]);

  useEffect(() => {
    if (subCategoryLoadable.state === 'hasValue' && subCategoryLoadable.contents !== null) {
      setSubCategory({
        normalRecords: subCategoryLoadable.contents.normalRecords,
        incompleteRecords: subCategoryLoadable.contents.incompleteRecords,
        suspensionRecords: subCategoryLoadable.contents.suspensionRecords,
        mismatchRecords: subCategoryLoadable.contents.mismatchRecords,
        recycledRecords: [],
        shouldRerender: true,
      });
    } else {
      setSubCategory((prev) => {
        if (prev !== null) {
          return { ...prev, shouldRerender: true };
        } else {
          return prev;
        }
      });
    }
  }, [subCategoryLoadable]);

  useEffect(() => {
    if (subCategory !== null && subCategory.shouldRerender) {
      setNormalList(subCategory.normalRecords);
      setSuspensionList(subCategory.suspensionRecords);
      setIncompleteList(subCategory.incompleteRecords);
      setMismatchList(subCategory.mismatchRecords);
      setRecycledList(subCategory.recycledRecords);
    }
  }, [subCategory]);

  const windowProps: SubWindowProps = useMemo(() => {
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

  const shouldShowList = useMemo(() => {
    return subCategoryLoadable.state === 'hasValue' && appStatus >= AppStatus.CanMatchClass;
  }, [subCategoryLoadable, appStatus]);

  const isMatching = useMemo(() => {
    return !!sourceFilePath.filename && appStatus >= AppStatus.CanMatchClass;
  }, [sourceFilePath, appStatus]);

  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">班级匹配</h1>
        <p className="mdc-text-sm">基于 N-Gram 算法模糊搜索，评分并匹配给定班级。</p>
      </div>
      {shouldShowList ? (
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
          {isMatching ? (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
                  <Searching theme={themeMode} />
                  <p className="mdc-text-sm text-center">正在匹配</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
                  <IconPending theme={themeMode} />
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
