/**
 * suspense fallback component
 */
import { getSourceFilename, primaryCategoryState } from '@/middleware/store';
import clsx from 'clsx';
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useRecoilValueLoadable, useRecoilValue } from 'recoil';
import CategorySubtitle from './CategorySubtitle';
import log from '@/middleware/logger';
import ListItem from '@/components/ListItem';
import CategoryWindow, { RowProps } from './CategoryWindow';
import IconPending from './Pending';

const Category: FC = () => {
  const categoryLoadable = useRecoilValueLoadable(primaryCategoryState);
  const sourceBaseName = useRecoilValue(getSourceFilename);
  const [acceptedList, setAcceptedList] = useState<RowProps[]>([]);
  const [recycledList, setRecycledList] = useState<RowProps[]>([]);

  const checkLoadable = () => {
    log.info('categoryLoadable', categoryLoadable.state);
    log.info('categoryLoadable', categoryLoadable.contents);
  };

  useEffect(() => {
    if (categoryLoadable.state === 'hasValue') {
      setAcceptedList(
        categoryLoadable.contents.map((item) => ({
          company: item['单位'],
          name: item['姓名'],
          index: item['序号'],
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
              <span className=" mdc-text-heightlight">80</span>条疑似数据，
              <span className=" mdc-text-heightlight">7680</span>条其他数据，
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
          <CategoryWindow records={acceptedList} clickHandler={removeItem} />
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
            <>
              已导入「<span className="mdc-text-heightlight">{sourceBaseName}</span>
              」，正在匹配单位数据...
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Category;
