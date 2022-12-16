/**
 * suspense fallback component
 */
import {
  getCategory,
  navIndexState,
  NavIndex,
  getUuid,
  subCategoryInfoState,
  matchingRuleState,
  appStatusState,
  platformState,
  sourceFilePathState,
  getIsWin32,
  categoryState,
  subCategoryUpdateTriggerState,
} from '@/middleware/store';
import clsx from 'clsx';
import { FC, useMemo } from 'react';
import { useState, useEffect } from 'react';
import { useRecoilValueLoadable, useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import log from '@/middleware/logger';
import CategoryWindow from './CategoryWindow';
import IconPending from '@/assets/illustrations/Pending';
import Searching from '@/assets/illustrations/Searching';
import CategoryButtonGroup, { ListIndex } from './CategoryButtonGroup';
import { AppStatus, receiveModifiedRecords, CategoryItem, BaseRecord } from '@/api/core';
import { useThemeContext } from '@/components/theme';
import Spin from '@/assets/others/Spin';
import { getTimestamp } from '@/middleware/utils';
import { useDebounce } from 'usehooks-ts';

export interface WindowProps {
  displayList: BaseRecord[];
  actionTag: string;
  actionHandler: (id: number) => void;
}

const Category: FC = () => {
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const isWin32 = useRecoilValue(getIsWin32);
  const setNavIndex = useSetRecoilState(navIndexState);
  const subCategoryInfo = useRecoilValue(subCategoryInfoState);
  const matchingRule = useRecoilValue(matchingRuleState);
  const uuid = useRecoilValue(getUuid);
  const categoryLoadable = useRecoilValueLoadable(getCategory);
  const [category, setCategory] = useRecoilState(categoryState);
  const setSubCategoryUpdateTrigger = useSetRecoilState(subCategoryUpdateTriggerState);
  const sourceFilePath = useRecoilValue(sourceFilePathState);
  const [isLoading, setIsLoading] = useState(false);
  const { themeMode } = useThemeContext();
  // List
  const [listIndex, setListIndex] = useState(ListIndex.Certainty);
  const [certaintyList, setCertaintyList] = useState<BaseRecord[]>([]);
  const [probablyList, setProbablyList] = useState<BaseRecord[]>([]);
  const [possibilityList, setPossibilityList] = useState<BaseRecord[]>([]);
  const [improbabilityList, setImprobabilityList] = useState<BaseRecord[]>([]);
  const [recycledList, setRecycledList] = useState<BaseRecord[]>([]);
  // Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  useEffect(() => {
    if (categoryLoadable.state === 'hasValue' && categoryLoadable.contents !== null) {
      if (subCategoryInfo.available) {
        setCategory({
          shouldRerender: true,
          certaintyList: categoryLoadable.contents.certaintyRecords.map((item) => item.now),
          probablyList: categoryLoadable.contents.probablyRecords.map((item) => item.now),
          possibilityList: categoryLoadable.contents.possibilityRecords.map((item) => item.now),
          improbabilityList: categoryLoadable.contents.improbabilityRecords.map((item) => item.now),
          recycledList: [],
        });
      } else {
        setCategory({
          shouldRerender: true,
          certaintyList: categoryLoadable.contents.certaintyRecords.map((item) => item.now),
          probablyList: [],
          possibilityList: categoryLoadable.contents.possibilityRecords.map((item) => item.now),
          improbabilityList: [
            ...categoryLoadable.contents.probablyRecords.map((item) => item.now),
            ...categoryLoadable.contents.improbabilityRecords.map((item) => item.now),
          ],
          recycledList: [],
        });
      }
    } else {
      setCategory((prev) => {
        if (prev !== null) {
          return { ...prev, shouldRerender: true };
        } else {
          return prev;
        }
      });
    }
  }, [categoryLoadable, subCategoryInfo]);

  useEffect(() => {
    if (category !== null && category.shouldRerender) {
      setCertaintyList(category.certaintyList);
      setProbablyList(category.probablyList);
      setPossibilityList(category.possibilityList);
      setImprobabilityList(category.improbabilityList);
      setRecycledList(category.recycledList);
    }
  }, [category]);

  const windowProps: WindowProps = useMemo(() => {
    let props: WindowProps = {
      displayList: [],
      actionTag: '',
      actionHandler: () => {},
    };
    switch (listIndex) {
      case ListIndex.Certainty:
        props = {
          displayList: certaintyList,
          actionTag: '移除',
          actionHandler: (index) => {
            const item = certaintyList.find((item) => item.index === index);
            if (item) {
              setRecycledList([item, ...recycledList]);
              setCertaintyList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
        break;
      case ListIndex.Probably:
        props = {
          displayList: probablyList,
          actionTag: '添加',
          actionHandler: (index) => {
            const item = probablyList.find((item) => item.index === index);
            if (item) {
              let modifiedItem: BaseRecord = {
                ...item,
                company: `${matchingRule.name} ${item.company}`,
              };
              setCertaintyList((prev) => [modifiedItem, ...prev]);
              setProbablyList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
        break;
      case ListIndex.Possibility:
        props = {
          displayList: possibilityList,
          actionTag: '添加',
          actionHandler: (index) => {
            const item = possibilityList.find((item) => item.index === index);
            if (item) {
              setCertaintyList((prev) => [item, ...prev]);
              setPossibilityList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
        break;
      case ListIndex.Improbability:
        props = {
          displayList: improbabilityList,
          actionTag: '添加',
          actionHandler: (index) => {
            const item = improbabilityList.find((item) => item.index === index);
            if (item) {
              let modifiedItem: BaseRecord = {
                ...item,
                company: `${matchingRule.name} ${item.company}`,
              };
              setCertaintyList((prev) => [modifiedItem, ...prev]);
              setImprobabilityList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
        break;
      case ListIndex.Recycled:
        props = {
          displayList: recycledList,
          actionTag: '撤销',
          actionHandler: (index) => {
            const item = recycledList.find((item) => item.index === index);
            if (item) {
              setCertaintyList((prev) => [item, ...prev]);
              setRecycledList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
        break;
      default:
        props = {
          displayList: [],
          actionTag: '',
          actionHandler: () => {},
        };
        break;
    }
    if (debouncedSearchKeyword.length > 0) {
      props.displayList = props.displayList.filter((item) => {
        return (
          item.company.includes(debouncedSearchKeyword) ||
          item.name.includes(debouncedSearchKeyword)
        );
      });
    }
    return props;
  }, [
    listIndex,
    certaintyList,
    probablyList,
    possibilityList,
    improbabilityList,
    recycledList,
    debouncedSearchKeyword,
  ]);

  const handleSubmit = async () => {
    log.info('submit');
    setIsLoading(true);
    setCategory({
      shouldRerender: false,
      certaintyList: certaintyList,
      probablyList: probablyList,
      possibilityList: possibilityList,
      improbabilityList: improbabilityList,
      recycledList: recycledList,
    });
    receiveModifiedRecords(certaintyList, uuid, isWin32)
      .then(() => {
        setIsLoading(false);
        if (subCategoryInfo.available) {
          setSubCategoryUpdateTrigger(getTimestamp());
          setAppStatus(AppStatus.CanMatchClass);
          setNavIndex(NavIndex.SubCategory);
        } else {
          setAppStatus(AppStatus.ExportWithoutClass);
          setNavIndex(NavIndex.Download);
        }
      })
      .catch((e) => {
        log.error(e);
        setIsLoading(false);
      });
  };

  const shouldShowList = useMemo(() => {
    return categoryLoadable.state === 'hasValue' && appStatus >= AppStatus.CanMatchCompany;
  }, [categoryLoadable, appStatus]);

  const isMatching = useMemo(() => {
    return !!sourceFilePath.filename && appStatus >= AppStatus.CanMatchCompany;
  }, [sourceFilePath, appStatus]);

  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1
          className="mdc-title pb-1.5"
          onClick={() => {
            log.info('categoryLoadable', categoryLoadable.state);
            log.info('categoryLoadable', categoryLoadable.contents);
          }}
        >
          单位匹配
        </h1>
        <p className="mdc-text-sm">
          {shouldShowList ? (
            debouncedSearchKeyword.length === 0 ? (
              <>
                极大概率匹配<span className=" mdc-text-heightlight">{certaintyList.length}</span>
                条，
                {subCategoryInfo.available && (
                  <>
                    一定概率<span className=" mdc-text-heightlight">{probablyList.length}</span>条，
                  </>
                )}
                较小概率<span className=" mdc-text-heightlight">{possibilityList.length}</span>条，
                极小概率<span className=" mdc-text-heightlight">{improbabilityList.length}</span>
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
                <>
                  已导入「<span className="mdc-text-heightlight">{sourceFilePath.filename}</span>
                  」，正在匹配单位数据...
                </>
              ) : appStatus === AppStatus.NoRule ? (
                <>请先在「设置」栏目下导入规则，再进行单位的匹配。</>
              ) : (
                <>请先在「导入」栏目下选择文件，再进行单位的匹配。</>
              )}
            </>
          )}
        </p>
        {/* {categoryLoadable.state === 'hasError' && <>{categoryLoadable.contents}</>} */}
      </div>
      {shouldShowList ? (
        <div className="flex flex-col items-end w-full h-full space-y-4">
          <CategoryButtonGroup
            showInDict={subCategoryInfo.available}
            listIndex={listIndex}
            setListIndex={setListIndex}
          />
          <CategoryWindow
            records={windowProps.displayList}
            actionTag={windowProps.actionTag}
            actionHandler={windowProps.actionHandler}
          />
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
                  className="bg-haruki-50 border leading-none text-sm rounded focus:border-primary-light block w-full pl-10 pr-8 h-8 placeholder-zinc-400 dark:border-abyss-600 dark:bg-abyss-700 dark:border-opacity-50 dark:placeholder-zinc-500 dark:text-zinc-200 dark:focus:border-primary-dark text-abyss-900 focus:outline-none"
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

            <button
              className="mdc-btn-primary p-1 h-full w-32 mr-12 lg:mr-14"
              onClick={handleSubmit}
            >
              {isLoading ? <Spin /> : <>提交</>}
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
                  <p className="mdc-text-sm text-center">应用空闲，可在「设置」修改单位匹配规则</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Category;
