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
import { AppStatus, receiveModifiedRecords, BaseRecord } from '@/api/core';
import { useThemeContext } from '@/components/theme';
import { getTimestamp } from '@/middleware/utils';
import { useDebounce } from 'usehooks-ts';
import PageMotion from '@/components/transition/PageMotion';
import SearchInput from '@/components/Interaction/SearchInput';
import IdlePlaceholder from '@/components/loading/IdlePlaceholder';
import ButtonGroup from '@/components/Interaction/ButtonGroup';
import { CategoryIndex, listInfoWithSub, listInfoWithoutSub } from './components/list';
import { AnimatePresence } from 'framer-motion';

export interface WindowProps {
  displayList: BaseRecord[];
  actionTag: string;
  actionHandler: (id: number) => void;
}

const Category: FC = () => {
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const uuid = useRecoilValue(getUuid);
  const isWin32 = useRecoilValue(getIsWin32);
  const setNavIndex = useSetRecoilState(navIndexState);
  const subCategoryInfo = useRecoilValue(subCategoryInfoState);
  const matchingRule = useRecoilValue(matchingRuleState);
  const categoryLoadable = useRecoilValueLoadable(getCategory);
  const [category, setCategory] = useRecoilState(categoryState);
  const setSubCategoryUpdateTrigger = useSetRecoilState(subCategoryUpdateTriggerState);
  const sourceFilePath = useRecoilValue(sourceFilePathState);
  const [isLoading, setIsLoading] = useState(false);
  const { themeMode } = useThemeContext();
  // List
  const [listIndex, setListIndex] = useState(CategoryIndex.Certainty);
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
      case CategoryIndex.Certainty:
        props = {
          displayList: certaintyList,
          actionTag: '??????',
          actionHandler: (index) => {
            const item = certaintyList.find((item) => item.index === index);
            if (item) {
              setRecycledList([item, ...recycledList]);
              setCertaintyList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
        break;
      case CategoryIndex.Probably:
        props = {
          displayList: probablyList,
          actionTag: '??????',
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
      case CategoryIndex.Possibility:
        props = {
          displayList: possibilityList,
          actionTag: '??????',
          actionHandler: (index) => {
            const item = possibilityList.find((item) => item.index === index);
            if (item) {
              setCertaintyList((prev) => [item, ...prev]);
              setPossibilityList((prev) => prev.filter((item) => item.index !== index));
            }
          },
        };
        break;
      case CategoryIndex.Improbability:
        props = {
          displayList: improbabilityList,
          actionTag: '??????',
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
      case CategoryIndex.Recycled:
        props = {
          displayList: recycledList,
          actionTag: '??????',
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
    if (isLoading) {
      return;
    }
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
    <PageMotion>
      <div className="mdc-header">
        <h1
          className="mdc-title pb-1.5"
          onClick={() => {
            log.info('categoryLoadable', categoryLoadable.state);
            log.info('categoryLoadable', categoryLoadable.contents);
          }}
        >
          ????????????
        </h1>
        <p className="mdc-text-sm">
          {shouldShowList ? (
            debouncedSearchKeyword.length === 0 ? (
              <>
                ??????????????????<span className=" mdc-text-heightlight">{certaintyList.length}</span>
                ??????
                {subCategoryInfo.available && (
                  <>
                    ????????????<span className=" mdc-text-heightlight">{probablyList.length}</span>??????
                  </>
                )}
                ????????????<span className=" mdc-text-heightlight">{possibilityList.length}</span>??????
                ????????????<span className=" mdc-text-heightlight">{improbabilityList.length}</span>
                ?????? ?????????<span className=" mdc-text-heightlight">{recycledList.length}</span>??????
              </>
            ) : (
              <>
                ??????????????????<span className="mdc-text-heightlight">{debouncedSearchKeyword}</span>
                ???????????????
                <span className="mdc-text-heightlight">{windowProps.displayList.length}</span>??????
              </>
            )
          ) : (
            <>
              {isMatching ? (
                <>
                  ????????????<span className="mdc-text-heightlight">{sourceFilePath.filename}</span>
                  ??????????????????????????????...
                </>
              ) : appStatus === AppStatus.NoRule ? (
                <>????????????????????????????????????????????????????????????????????????</>
              ) : (
                <>????????????????????????????????????????????????????????????????????????</>
              )}
            </>
          )}
        </p>
      </div>
      {shouldShowList ? (
        <div className="flex flex-col items-end w-full h-full space-y-4">
          <ButtonGroup<CategoryIndex>
            infoList={subCategoryInfo.available ? listInfoWithSub : listInfoWithoutSub}
            currentIndex={listIndex}
            setCurrentIndex={setListIndex}
          />
          <AnimatePresence mode="wait">
            <CategoryWindow
              key={`category-window-${listIndex}`}
              records={windowProps.displayList}
              actionTag={windowProps.actionTag}
              actionHandler={windowProps.actionHandler}
            />
          </AnimatePresence>
          <SearchInput
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            debouncedSearchKeyword={debouncedSearchKeyword}
            isLoading={isLoading}
            clickHandler={handleSubmit}
          />
        </div>
      ) : (
        <IdlePlaceholder
          isMatching={isMatching}
          idlePlaceholder={'?????????????????????????????????????????????????????????'}
          matchingPlaceholder={'????????????'}
        />
      )}
    </PageMotion>
  );
};

export default Category;
