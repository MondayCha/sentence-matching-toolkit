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
import { AppStatus, BaseRecord, SubCategoryItem, rematchSubCategory } from '@/api/core';
import PageMotion from '@/components/transition/PageMotion';
import { showMessage } from '@/middleware/message';

export interface SubWindowProps {
  displayList: SubCategoryItem[];
  actionTag: string;
  actionHandler: (item: SubCategoryItem) => void;
}

const SubCategory: FC = () => {
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const sourceFilePath = useRecoilValue(sourceFilePathState);
  const subCategoryLoadable = useRecoilValueLoadable(getSubCategory);
  const [subCategory, setSubCategory] = useRecoilState(subCategoryState);

  const { themeMode } = useThemeContext();

  const [listIndex, setListIndex] = useState(SubListIndex.Normal);
  const [showModal, setShowModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<SubCategoryItem | null>(null);
  const [currentInfo, setCurrentInfo] = useState({
    name: '',
    company: '',
  });

  const [normalList, setNormalList] = useState<SubCategoryItem[]>([]);
  const [incompleteList, setIncompleteList] = useState<SubCategoryItem[]>([]);
  const [suspensionList, setSuspensionList] = useState<SubCategoryItem[]>([]);
  const [mismatchList, setMismatchList] = useState<SubCategoryItem[]>([]);
  const [recycledList, setRecycledList] = useState<SubCategoryItem[]>([]);

  const handleRematch = () => {
    currentRecord &&
      rematchSubCategory(currentRecord.raw, currentInfo.name, currentInfo.company)
        .then((res) => {
          setCurrentRecord(res);
        })
        .catch((e) => {
          showMessage(e, 'error');
        });
  };

  const handleSave = () => {
    if (!!currentRecord) {
      switch (listIndex) {
        case SubListIndex.Normal:
          if (currentRecord.flag === 'Normal') {
            setNormalList((prev) => [
              currentRecord,
              ...prev.filter((s) => s.raw.index !== currentRecord.raw.index),
            ]);
          } else {
            setNormalList((prev) => prev.filter((s) => s.raw.index !== currentRecord.raw.index));
            setMismatchList((prev) => [currentRecord, ...prev]);
          }
          break;
        case SubListIndex.Incomplete:
          if (currentRecord.flag === 'Normal') {
            setIncompleteList((prev) =>
              prev.filter((s) => s.raw.index !== currentRecord.raw.index)
            );
            setNormalList((prev) => [currentRecord, ...prev]);
          }
          break;
        case SubListIndex.Suspension:
          if (currentRecord.flag === 'Normal') {
            setSuspensionList((prev) =>
              prev.filter((s) => s.raw.index !== currentRecord.raw.index)
            );
            setNormalList((prev) => [currentRecord, ...prev]);
          }
          break;
        case SubListIndex.Mismatch:
          if (currentRecord.flag === 'Normal') {
            setMismatchList((prev) => prev.filter((s) => s.raw.index !== currentRecord.raw.index));
            setNormalList((prev) => [currentRecord, ...prev]);
          }
          break;
        case SubListIndex.Recycled:
          if (currentRecord.flag === 'Normal') {
            setRecycledList((prev) => prev.filter((s) => s.raw.index !== currentRecord.raw.index));
            setNormalList((prev) => [currentRecord, ...prev]);
          }
          break;
        default:
          break;
      }
    }
    setCurrentRecord(null);
    setCurrentInfo({ name: '', company: '' });
  };

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
          actionHandler: (item) => {
            setCurrentRecord(item);
            setCurrentInfo({ name: item.raw.name, company: item.raw.company });
          },
        };
      case SubListIndex.Incomplete:
        return {
          displayList: incompleteList,
          actionTag: '添加',
          actionHandler: (item) => {
            setCurrentRecord(item);
            setCurrentInfo({ name: item.raw.name, company: item.raw.company });
          },
        };
      case SubListIndex.Suspension:
        return {
          displayList: suspensionList,
          actionTag: '添加',
          actionHandler: (item) => {
            setCurrentRecord(item);
            setCurrentInfo({ name: item.raw.name, company: item.raw.company });
          },
        };
      case SubListIndex.Mismatch:
        return {
          displayList: mismatchList,
          actionTag: '添加',
          actionHandler: (item) => {
            setCurrentRecord(item);
            setCurrentInfo({ name: item.raw.name, company: item.raw.company });
          },
        };
      case SubListIndex.Recycled:
        return {
          displayList: recycledList,
          actionTag: '撤销',
          actionHandler: (item) => {
            setCurrentRecord(item);
            setCurrentInfo({ name: item.raw.name, company: item.raw.company });
          },
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

  const shouldRematch = useMemo(() => {
    if (currentRecord === null) {
      return false;
    }
    return (
      currentInfo.name !== currentRecord.raw.name ||
      currentInfo.company !== currentRecord.raw.company
    );
  }, [currentInfo, currentRecord]);

  return (
    <PageMotion>
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
      {/* <!-- Main modal --> */}
      {currentRecord !== null && (
        <div
          id="defaultModal"
          tabIndex={-1}
          className={clsx(
            'absolute inset-0 z-50 w-full h-full overflow-x-hidden overflow-y-auto flex justify-center items-center'
          )}
        >
          {/* <!-- Modal content --> */}
          <div className="bg-white rounded-lg shadow p-4 dark:bg-abyss-850 max-h-96 w-3/5 max-w-xl flex flex-col">
            {/* <!-- Modal body --> */}
            <div className=" overflow-y-auto mdc-scroolbar grow space-y-3">
              <p className="mdc-text-xs leading-tight">姓名：{currentRecord.raw.name}</p>
              <p className="mdc-text-xs leading-tight">单位：{currentRecord.raw.company}</p>
              <p className="mdc-text-xs leading-tight">姓名：{currentRecord.sub.name}</p>
              <p className="mdc-text-xs leading-tight">班级：{currentRecord.sub.company}</p>
              <p className="mdc-text-xs leading-tight">
                匹配：{currentRecord.matchedClass ?? '无'}
              </p>
              <input
                type="text"
                value={currentInfo.name}
                className="bg-haruki-50 border leading-none mdc-text-xs rounded focus:border-primary-light-400 block w-full px-4 h-8 placeholder-zinc-400 dark:border-abyss-600 dark:bg-abyss-700 dark:border-opacity-50 dark:placeholder-zinc-500 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                autoCapitalize="off"
                onChange={(e) => {
                  setCurrentInfo((prev) => ({
                    name: e.target.value,
                    company: prev.company,
                  }));
                }}
              />
              <input
                type="text"
                value={currentInfo.company}
                className="bg-haruki-50 border leading-none mdc-text-xs rounded focus:border-primary-light-400 block w-full px-4 h-8 placeholder-zinc-400 dark:border-abyss-600 dark:bg-abyss-700 dark:border-opacity-50 dark:placeholder-zinc-500 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                autoCapitalize="off"
                onChange={(e) => {
                  setCurrentInfo((prev) => ({
                    name: prev.name,
                    company: e.target.value,
                  }));
                }}
              />
            </div>
            {/* <!-- Modal footer --> */}
            <div className="flex items-center pt-3 justify-end space-x-3 border-gray-200 rounded-b dark:border-gray-600">
              <button
                data-modal-toggle="defaultModal"
                type="button"
                className="mdc-btn-secondary h-8 leading-none w-32"
                onClick={() => {
                  setCurrentRecord(null);
                }}
              >
                取消
              </button>
              <button
                data-modal-toggle="defaultModal"
                type="button"
                className="mdc-btn-primary h-8 leading-none w-32"
                onClick={shouldRematch ? handleRematch : handleSave}
              >
                {shouldRematch ? '匹配' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageMotion>
  );
};

export default SubCategory;
