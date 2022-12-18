import type { FC } from 'react';
import log from '@/middleware/logger';
import { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
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
import {
  AppStatus,
  ModifiedSubCategoryItem,
  SubCategoryItem,
  receiveModifiedSubCategory,
  rematchSubCategory,
} from '@/api/core';
import PageMotion from '@/components/transition/PageMotion';
import { showConfirm, showMessage } from '@/middleware/message';
import NormalWindow from './components/NormalWindow';
import OtherWindow from './components/OtherWindow';
import { AnimatePresence } from 'framer-motion';
import RecycleWindow from './components/RecycleWindow';
import { useDebounce } from 'usehooks-ts';
import SearchInput from '@/components/Interaction/SearchInput';
import IdlePlaceholder from '@/components/loading/IdlePlaceholder';
import { SubCategoryIndex, listInfo } from './components/list';
import ButtonGroup from '@/components/Interaction/ButtonGroup';
import RematchModal, { CurrentInfo } from './components/RematchModal';

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
  const [listIndex, setListIndex] = useState(SubCategoryIndex.Normal);
  const [currentRecord, setCurrentRecord] = useState<SubCategoryItem | null>(null);
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
      case SubCategoryIndex.Normal:
        props = {
          displayList: normalList,
          setDisplayList: setNormalList,
        };
        break;
      case SubCategoryIndex.Incomplete:
        props = {
          displayList: incompleteList,
          setDisplayList: setIncompleteList,
        };
        break;
      case SubCategoryIndex.Suspension:
        props = {
          displayList: suspensionList,
          setDisplayList: setSuspensionList,
        };
        break;
      case SubCategoryIndex.Mismatch:
        props = {
          displayList: mismatchList,
          setDisplayList: setMismatchList,
        };
        break;
      case SubCategoryIndex.Recycled:
        props = {
          displayList: recycledList,
          setDisplayList: setRecycledList,
        };
        break;
    }
    if (debouncedSearchKeyword.length > 0) {
      // debug
      if (debouncedSearchKeyword === 'calc') {
        props.displayList = props.displayList.filter((item) => item.isNameInDict === false);
      } else if (debouncedSearchKeyword === 'with') {
        props.displayList = props.displayList.filter(
          (item) => item.isNameInDict === false && item.sub.name.length > 0
        );
      } else if (debouncedSearchKeyword === 'without') {
        props.displayList = props.displayList.filter((item) => item.sub.name === '');
      } else {
        props.displayList = props.displayList.filter(
          (item) =>
            item.sub.company.includes(debouncedSearchKeyword) ||
            item.sub.name.includes(debouncedSearchKeyword) ||
            item.matchedClass?.includes(debouncedSearchKeyword)
        );
      }
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
  };

  const modifyStartHandler = (item: SubCategoryItem) => {
    setCurrentRecord(item);
  };

  const handleRematch = (currentInfo: CurrentInfo) => {
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
          <ButtonGroup<SubCategoryIndex>
            infoList={listInfo}
            currentIndex={listIndex}
            setCurrentIndex={setListIndex}
          />
          <AnimatePresence mode="wait">
            {listIndex === SubCategoryIndex.Normal ? (
              <NormalWindow
                records={windowProps.displayList}
                modifyHandler={modifyStartHandler}
                deleteHandler={deleteHandler}
              />
            ) : listIndex === SubCategoryIndex.Incomplete ? (
              <OtherWindow
                key={'Incomplete'}
                records={windowProps.displayList}
                modifyHandler={modifyStartHandler}
                deleteHandler={deleteHandler}
              />
            ) : listIndex === SubCategoryIndex.Suspension ? (
              <OtherWindow
                key={'Suspension'}
                records={windowProps.displayList}
                modifyHandler={modifyStartHandler}
                deleteHandler={deleteHandler}
              />
            ) : listIndex === SubCategoryIndex.Mismatch ? (
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
          <SearchInput
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            debouncedSearchKeyword={debouncedSearchKeyword}
            isLoading={isSaving}
            clickHandler={saveHandler}
          />
        </div>
      ) : (
        <IdlePlaceholder
          isMatching={isMatching}
          idlePlaceholder={'应用空闲，可在「设置」修改班级信息'}
          matchingPlaceholder={'正在匹配'}
        />
      )}
      {/* <!-- Main modal --> */}
      {currentRecord !== null && (
        <RematchModal
          currentRecord={currentRecord}
          handleCancel={() => {
            setCurrentRecord(null);
          }}
          handleRematch={handleRematch}
          handleSave={handleSave}
          isRematching={isRematching}
        />
      )}
    </PageMotion>
  );
};

export default SubCategory;
