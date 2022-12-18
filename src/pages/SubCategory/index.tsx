import type { FC } from 'react';
import log from '@/middleware/logger';
import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import IconPending from '@/assets/illustrations/Pending';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil';
import {
  NavIndex,
  appStatusState,
  getIsWin32,
  getSubCategory,
  getUuid,
  navIndexState,
  sourceFilePathState,
  subCategoryState,
} from '@/middleware/store';
import Searching from '@/assets/illustrations/Searching';
import SubCategoryButtonGroup, { SubListIndex } from './components/SubCategoryButtonGroup';
import CategoryWindow from '../Category/CategoryWindow';
import SubCategoryWindow from './components/SubCategoryWindow';
import { useThemeContext } from '@/components/theme';
import {
  AppStatus,
  BaseRecord,
  ModifiedSubCategoryItem,
  SubCategoryItem,
  receiveModifiedSubCategory,
  rematchSubCategory,
} from '@/api/core';
import PageMotion from '@/components/transition/PageMotion';
import { showConfirm, showMessage } from '@/middleware/message';
import { ListIndex } from '../Category/CategoryButtonGroup';
import NormalWindow from './components/NormalWindow';
import Spin from '@/assets/others/Spin';
import OtherWindow from './components/OtherWindow';
import { AnimatePresence } from 'framer-motion';
import RecycleWindow from './components/RecycleWindow';
import { useDebounce } from 'usehooks-ts';

export interface SubWindowProps {
  displayList: SubCategoryItem[];
  setDisplayList: React.Dispatch<React.SetStateAction<SubCategoryItem[]>>;
}

const SubCategory: FC = () => {
  const uuid = useRecoilValue(getUuid);
  const isWin32 = useRecoilValue(getIsWin32);
  const setNavIndex = useSetRecoilState(navIndexState);
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const sourceFilePath = useRecoilValue(sourceFilePathState);
  const subCategoryLoadable = useRecoilValueLoadable(getSubCategory);
  const [subCategory, setSubCategory] = useRecoilState(subCategoryState);

  const { themeMode } = useThemeContext();

  const [listIndex, setListIndex] = useState(SubListIndex.Normal);
  const [currentRecord, setCurrentRecord] = useState<SubCategoryItem | null>(null);
  const [currentInfo, setCurrentInfo] = useState({
    name: '',
    company: '',
  });
  const [isRematching, setIsRematching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const [normalList, setNormalList] = useState<SubCategoryItem[]>([]);
  const [incompleteList, setIncompleteList] = useState<SubCategoryItem[]>([]);
  const [suspensionList, setSuspensionList] = useState<SubCategoryItem[]>([]);
  const [mismatchList, setMismatchList] = useState<SubCategoryItem[]>([]);
  const [recycledList, setRecycledList] = useState<SubCategoryItem[]>([]);

  // some page control states
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

  // list load effect
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

  // handler
  const windowProps: SubWindowProps = useMemo(() => {
    let props: SubWindowProps = {
      displayList: normalList,
      setDisplayList: setNormalList,
    };
    switch (listIndex) {
      case SubListIndex.Normal:
        props = {
          displayList: normalList,
          setDisplayList: setNormalList,
        };
        break;
      case SubListIndex.Incomplete:
        props = {
          displayList: incompleteList,
          setDisplayList: setIncompleteList,
        };
        break;
      case SubListIndex.Suspension:
        props = {
          displayList: suspensionList,
          setDisplayList: setSuspensionList,
        };
        break;
      case SubListIndex.Mismatch:
        props = {
          displayList: mismatchList,
          setDisplayList: setMismatchList,
        };
        break;
      case SubListIndex.Recycled:
        props = {
          displayList: recycledList,
          setDisplayList: setRecycledList,
        };
        break;
    }
    if (debouncedSearchKeyword.length > 0) {
      props.displayList = props.displayList.filter((item) => {
        return (
          item.sub.company.includes(debouncedSearchKeyword) ||
          item.sub.name.includes(debouncedSearchKeyword) ||
          item.matchedClass?.includes(debouncedSearchKeyword)
        );
      });
    }
    return props;
  }, [
    listIndex,
    normalList,
    suspensionList,
    incompleteList,
    mismatchList,
    recycledList,
    debouncedSearchKeyword,
  ]);

  const handleSave = () => {
    if (!!currentRecord) {
      // remove item from list first
      windowProps.setDisplayList((prev) =>
        prev.filter((s) => s.raw.index !== currentRecord.raw.index)
      );
      if (currentRecord.flag === 'Normal') {
        setNormalList((prev) => [currentRecord, ...prev]);
      } else {
        setMismatchList((prev) => [currentRecord, ...prev]);
      }
    }
    setCurrentRecord(null);
    setCurrentInfo({ name: '', company: '' });
  };

  const modifyStartHandler = (item: SubCategoryItem) => {
    setCurrentRecord(item);
    setCurrentInfo({ name: item.raw.name, company: item.raw.company });
  };

  const handleRematch = () => {
    if (currentRecord && !isRematching) {
      setIsRematching(true);
      rematchSubCategory(currentRecord.raw, currentInfo.name, currentInfo.company)
        .then((res) => {
          setCurrentRecord(res);
          setIsRematching(false);
        })
        .catch((e) => {
          showMessage(e, 'error');
          setIsRematching(false);
        });
    }
  };

  const deleteHandler = (item: SubCategoryItem) => {
    showConfirm('确定要删除该项目吗', 'info')
      .then((res) => {
        if (res) {
          setRecycledList((prev) => [item, ...prev]);
          windowProps.setDisplayList((prev) => prev.filter((i) => i.raw.index !== item.raw.index));
        }
      })
      .catch((e) => showMessage(e, 'error'));
  };

  const cancelHandler = (item: SubCategoryItem) => {
    switch (item.flag) {
      case 'Normal':
        setNormalList((prev) => [item, ...prev]);
        break;
      case 'Incomplete':
        setIncompleteList((prev) => [item, ...prev]);
        break;
      case 'Suspension':
        setSuspensionList((prev) => [item, ...prev]);
        break;
      case 'Mismatch':
        setMismatchList((prev) => [item, ...prev]);
        break;
    }
    setRecycledList((prev) => prev.filter((i) => i.raw.index !== item.raw.index));
  };

  const saveHandler = () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    const records: ModifiedSubCategoryItem[] = [
      ...normalList.map((item) => ({
        index: item.raw.index,
        name: item.sub.name,
        matchedClass: item.matchedClass,
      })),
      ...incompleteList.map((item) => ({
        index: item.raw.index,
        name: item.sub.name,
        matchedClass: '',
      })),
      ...suspensionList.map((item) => ({
        index: item.raw.index,
        name: item.sub.name,
        matchedClass: '',
      })),
      ...mismatchList.map((item) => ({
        index: item.raw.index,
        name: item.sub.name,
        matchedClass: '',
      })),
    ];
    receiveModifiedSubCategory(records, uuid, isWin32).then((_) => {
      setIsSaving(false);
      setAppStatus(AppStatus.ExportWithClass);
      setNavIndex(NavIndex.Download);
    });
  };

  return (
    <PageMotion>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">班级匹配</h1>
        <p className="mdc-text-sm">
          {shouldShowList ? (
            debouncedSearchKeyword.length === 0 ? (
              <>
                正常<span className=" mdc-text-heightlight">{normalList.length}</span>
                条，信息不完整<span className=" mdc-text-heightlight">{incompleteList.length}</span>
                条， 异常<span className=" mdc-text-heightlight">{suspensionList.length}</span>条，
                无班级信息<span className=" mdc-text-heightlight">{mismatchList.length}</span>
                条， 回收站<span className=" mdc-text-heightlight">{recycledList.length}</span>条。
              </>
            ) : (
              <>
                包含关键词「<span className="mdc-text-heightlight">{debouncedSearchKeyword}</span>
                」的数据有
                <span className="mdc-text-heightlight">{windowProps.displayList.length}</span>条。
              </>
            )
          ) : (
            <>
              {isMatching ? (
                <>基于 N-Gram 算法模糊搜索，评分并匹配给定班级。</>
              ) : appStatus === AppStatus.NoRule ? (
                <>请先在「设置」栏目下导入规则，再进行班级的匹配。</>
              ) : (
                <>请先在「导入」栏目下选择文件，再进行班级的匹配。</>
              )}
            </>
          )}
        </p>
      </div>
      {shouldShowList ? (
        <div className="flex flex-col items-end w-full h-full space-y-4">
          <SubCategoryButtonGroup subListIndex={listIndex} setSubListIndex={setListIndex} />
          <AnimatePresence mode="wait">
            {listIndex === SubListIndex.Normal ? (
              <NormalWindow
                records={windowProps.displayList}
                modifyHandler={modifyStartHandler}
                deleteHandler={deleteHandler}
              />
            ) : listIndex === SubListIndex.Incomplete ? (
              <OtherWindow
                key={'Incomplete'}
                records={windowProps.displayList}
                modifyHandler={modifyStartHandler}
                deleteHandler={deleteHandler}
              />
            ) : listIndex === SubListIndex.Suspension ? (
              <OtherWindow
                key={'Suspension'}
                records={windowProps.displayList}
                modifyHandler={modifyStartHandler}
                deleteHandler={deleteHandler}
              />
            ) : listIndex === SubListIndex.Mismatch ? (
              <OtherWindow
                key={'Mismatch'}
                records={windowProps.displayList}
                modifyHandler={modifyStartHandler}
                deleteHandler={deleteHandler}
              />
            ) : (
              <RecycleWindow records={windowProps.displayList} cancelHandler={cancelHandler} />
            )}
          </AnimatePresence>
          <div className="pl-4 lg:pl-6 flex flex-row justify-between items-center h-8 lg:h-9 w-full lg:pt-1">
            <form className="flex items-center">
              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-zinc-500 dark:text-zinc-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <input
                  type="text"
                  id="simple-search"
                  value={searchKeyword}
                  className="bg-haruki-50 border leading-none text-sm rounded focus:border-primary-light-400 block w-full pl-10 pr-8 h-8 placeholder-zinc-400 dark:border-abyss-600 dark:bg-abyss-700 dark:border-opacity-50 dark:placeholder-zinc-500 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
                  placeholder="输入关键字"
                  autoComplete="off"
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                  }}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    type="button"
                    className={clsx(
                      'inline-flex items-center p-0.5 ml-2 text-sm text-zinc-400 dark:text-zinc-500 bg-transparent rounded-full hover:bg-haruki-300 dark:hover:bg-abyss-600',
                      {
                        hidden: debouncedSearchKeyword.length === 0,
                      }
                    )}
                    onClick={() => {
                      setSearchKeyword('');
                    }}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Remove badge</span>
                  </button>
                </div>
              </div>
            </form>
            <button className="mdc-btn-primary p-1 w-32 mr-12 lg:mr-14" onClick={saveHandler}>
              {isSaving ? <Spin /> : '提交'}
            </button>
          </div>
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
          <div className="bg-white rounded-lg shadow-xl border dark:border-haruki-400 dark:border-opacity-10 p-4 dark:bg-abyss-850 max-h-96 w-3/5 max-w-xl flex flex-col">
            {/* <!-- Modal body --> */}
            <div className=" overflow-y-auto mdc-scroolbar grow space-y-3">
              <p className="mdc-text-xs leading-tight">用户数据-姓名：{currentRecord.raw.name}</p>
              <p className="mdc-text-xs leading-tight">
                用户数据-单位：{currentRecord.raw.company}
              </p>
              <p className="mdc-text-xs leading-tight">
                软件提取-姓名：
                <span className="mdc-text-heightlight">{currentRecord.sub.name}</span>
              </p>
              <p className="mdc-text-xs leading-tight">
                软件提取-班级：
                <span className="mdc-text-heightlight">{currentRecord.sub.company}</span>
              </p>
              <p className="mdc-text-xs leading-tight">
                软件提取-匹配：
                <span className="mdc-text-heightlight">{currentRecord.matchedClass ?? '无'}</span>
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
                {shouldRematch ? isRematching ? <Spin /> : '匹配' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageMotion>
  );
};

export default SubCategory;
