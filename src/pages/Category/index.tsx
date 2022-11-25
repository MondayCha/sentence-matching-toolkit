/**
 * suspense fallback component
 */
import { getSourceFilename, getCategory } from '@/middleware/store';
import clsx from 'clsx';
import { FC, useMemo } from 'react';
import { useState, useEffect } from 'react';
import { useRecoilValueLoadable, useRecoilValue } from 'recoil';
import CategorySubtitle from './CategorySubtitle';
import log from '@/middleware/logger';
import ListItem from '@/components/ListItem';
import CategoryWindow, { RowProps } from './CategoryWindow';
import IconPending from './Pending';

const Category: FC = () => {
  const categoryLoadable = useRecoilValueLoadable(getCategory);
  const sourceBaseName = useRecoilValue(getSourceFilename);
  const [acceptedList, setAcceptedList] = useState<RowProps[]>([]);
  const [rejectedList, setRejectedList] = useState<RowProps[]>([]);
  const [suspectedList, setSuspectedList] = useState<RowProps[]>([]);
  const [recycledList, setRecycledList] = useState<RowProps[]>([]);
  const [slider, setSlider] = useState('0');

  const checkLoadable = () => {
    log.info('categoryLoadable', categoryLoadable.state);
    log.info('categoryLoadable', categoryLoadable.contents);
  };

  useEffect(() => {
    if (categoryLoadable.state === 'hasValue' && categoryLoadable.contents !== undefined) {
      setAcceptedList(
        categoryLoadable.contents.acceptedRecords.map((item) => ({
          company: item.company,
          name: item.name,
          index: item.index,
        }))
      );
      setRejectedList(
        categoryLoadable.contents.rejectedRecords.map((item) => ({
          company: item.company,
          name: item.name,
          index: item.index,
        }))
      );
      setSuspectedList(
        categoryLoadable.contents.suspectedRecords.map((item) => ({
          company: item.company,
          name: item.name,
          index: item.index,
        }))
      );
    }
  }, [categoryLoadable]);

  const removeItem = (index: number) => {
    log.info('removeItem', index);
    const item = acceptedList.find((item) => item.index === index);
    if (item) {
      setRecycledList([item, ...recycledList]);
      setAcceptedList((prev) => prev.filter((item) => item.index !== index));
    }
  };

  const displayedList = useMemo(() => {
    switch (slider) {
      case '0':
        return suspectedList;
      case '1':
        return acceptedList;
      case '2':
        return rejectedList;
      case '3':
        return recycledList;
      default:
        return acceptedList;
    }
  }, [slider, acceptedList, suspectedList, rejectedList, recycledList]);

  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5" onClick={checkLoadable}>
          单位匹配
        </h1>
        <p className="mdc-text-sm">
          {categoryLoadable.state === 'hasValue' ? (
            <>
              现有<span className=" mdc-text-heightlight">{acceptedList.length}</span>
              条本单位数据，
              <span className=" mdc-text-heightlight">{suspectedList.length}</span>条疑似数据，
              <span className=" mdc-text-heightlight">{rejectedList.length}</span>条其他数据，
              <span className=" mdc-text-heightlight">{recycledList.length}</span>条回收站数据。
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
          <input
            className="mr-6 lg:mr-8"
            type="range"
            id="list"
            name="List"
            min={0}
            max={3}
            value={slider}
            onChange={(e) => setSlider(e.target.value)}
          />
          <CategoryWindow records={displayedList} clickHandler={removeItem} />
          <button className="mdc-btn-primary p-1 w-32 mr-12 lg:mr-14">提交</button>
        </div>
      ) : (
        <>
          {!sourceBaseName ? (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 cursor-pointer">
                  <IconPending />
                  <p className="mdc-text-sm text-center">应用空闲，可在「设置」修改单位匹配规则</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
              <div className="mdc-item py-12 grow">
                <div className="flex h-full w-full flex-col items-center justify-center space-y-3 cursor-pointer">
                  <IconPending />
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
