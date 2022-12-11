/**
 * suspense fallback component
 */
import {
  getSourceFilename,
  getCategory,
  navIndexState,
  NavIndex,
  getUuid,
  subCategoryInfoState,
  matchingRuleState,
  appStatusState,
  tempFilePathState,
  platformState,
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
import { AppStatus, receiveModifiedRecords, SourceRecord } from '@/api/core';
import { useThemeContext } from '@/components/theme';

export interface WindowProps {
  displayList: SourceRecord[];
  actionTag: string;
  actionHandler: (id: number) => void;
}

const Category: FC = () => {
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const platform = useRecoilValue(platformState);
  const setTempFilePath = useSetRecoilState(tempFilePathState);
  const setNavIndex = useSetRecoilState(navIndexState);
  const subCategoryInfo = useRecoilValue(subCategoryInfoState);
  const matchingRule = useRecoilValue(matchingRuleState);
  const uuid = useRecoilValue(getUuid);
  const categoryLoadable = useRecoilValueLoadable(getCategory);
  const sourceBaseName = useRecoilValue(getSourceFilename);
  const [isLoading, setIsLoading] = useState(false);
  const { themeMode } = useThemeContext();
  // List
  const [listIndex, setListIndex] = useState(ListIndex.Certainty);
  const [certaintyList, setCertaintyList] = useState<SourceRecord[]>([]);
  const [probablyList, setProbablyList] = useState<SourceRecord[]>([]);
  const [possibilityList, setPossibilityList] = useState<SourceRecord[]>([]);
  const [improbabilityList, setImprobabilityList] = useState<SourceRecord[]>([]);
  const [recycledList, setRecycledList] = useState<SourceRecord[]>([]);

  useEffect(() => {
    if (categoryLoadable.state === 'hasValue' && categoryLoadable.contents !== undefined) {
      setCertaintyList(categoryLoadable.contents.certaintyRecords);
      setPossibilityList(categoryLoadable.contents.possibilityRecords);
      if (subCategoryInfo.available) {
        setProbablyList(categoryLoadable.contents.probablyRecords);
        setImprobabilityList(categoryLoadable.contents.improbabilityRecords);
      } else {
        setImprobabilityList([
          ...categoryLoadable.contents.probablyRecords,
          ...categoryLoadable.contents.improbabilityRecords,
        ]);
      }
    }
  }, [categoryLoadable, subCategoryInfo]);

  const windowProps: WindowProps = useMemo(() => {
    switch (listIndex) {
      case ListIndex.Certainty:
        return {
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
      case ListIndex.Probably:
        return {
          displayList: probablyList,
          actionTag: '添加',
          actionHandler: (index) => {
            const item = probablyList.find((item) => item.index === index);
            if (item) {
              let modifiedItem: SourceRecord = {
                ...item,
                company: `${matchingRule.name} ${item.company}`,
              };
              setCertaintyList((prev) => [modifiedItem, ...prev]);
              setProbablyList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
      case ListIndex.Possibility:
        return {
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
      case ListIndex.Improbability:
        return {
          displayList: improbabilityList,
          actionTag: '添加',
          actionHandler: (index) => {
            const item = improbabilityList.find((item) => item.index === index);
            if (item) {
              let modifiedItem: SourceRecord = {
                ...item,
                company: `${matchingRule.name} ${item.company}`,
              };
              setCertaintyList((prev) => [modifiedItem, ...prev]);
              setImprobabilityList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
      case ListIndex.Recycled:
        return {
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
      default:
        return {
          displayList: [],
          actionTag: '',
          actionHandler: () => {},
        };
    }
  }, [listIndex, certaintyList, possibilityList, improbabilityList, recycledList]);

  const handleSubmit = async () => {
    log.info('submit');
    setIsLoading(true);
    receiveModifiedRecords(certaintyList, uuid, platform === 'win32')
      .then((path) => {
        log.info('receive modified records cached path', path);
        setTempFilePath(path);
        setIsLoading(false);
        if (subCategoryInfo.available) {
          setAppStatus(AppStatus.CanMatch2);
          setNavIndex(NavIndex.SubCategory);
        } else {
          setAppStatus(AppStatus.CanExport1);
          setNavIndex(NavIndex.Download);
        }
      })
      .catch((e) => {
        log.error(e);
        setIsLoading(false);
      });
  };

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
          {categoryLoadable.state === 'hasValue' ? (
            <>
              极大概率匹配<span className=" mdc-text-heightlight">{certaintyList.length}</span>
              条，
              {subCategoryInfo.available && (
                <>
                  一定概率<span className=" mdc-text-heightlight">{probablyList.length}</span>条，
                </>
              )}
              较小概率<span className=" mdc-text-heightlight">{possibilityList.length}</span>条，
              极小概率<span className=" mdc-text-heightlight">{improbabilityList.length}</span>条，
              回收站<span className=" mdc-text-heightlight">{recycledList.length}</span>条。
            </>
          ) : (
            <>
              {!sourceBaseName ? (
                <>请先在「导入」栏目下选择文件，再进行单位的匹配。</>
              ) : (
                <>
                  已导入「<span className="mdc-text-heightlight">{sourceBaseName}</span>
                  」，正在匹配单位数据...
                </>
              )}
            </>
          )}
        </p>
        {/* {categoryLoadable.state === 'hasError' && <>{categoryLoadable.contents}</>} */}
      </div>
      {categoryLoadable.state === 'hasValue' ? (
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
          <button className="mdc-btn-primary p-1 w-32 mr-12 lg:mr-14" onClick={handleSubmit}>
            <div className="flex flex-row items-center justify-center space-x-2">
              {isLoading ? (
                <div>
                  <svg
                    className="inline h-3.5 mr-1 text-sky-400  animate-spin fill-abyss-500 dark:fill-zinc-100"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
              ) : (
                <>提交</>
              )}
            </div>
          </button>
        </div>
      ) : (
        <>
          {!sourceBaseName ? (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
                  <IconPending isDark={themeMode === 'dark'} />
                  <p className="mdc-text-sm text-center">应用空闲，可在「设置」修改单位匹配规则</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
                  <Searching isDark={themeMode === 'dark'} />
                  <p className="mdc-text-sm text-center">正在匹配</p>
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
