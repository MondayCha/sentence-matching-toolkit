/**
 * suspense fallback component
 */
import { primaryCategoryState } from '@/middleware/store';
import clsx from 'clsx';
import type { FC } from 'react';
import { useState } from 'react';
import { useRecoilValueLoadable } from 'recoil';
import CategoryContent from './CategoryContent';
import log from '@/middleware/logger';
import ListItem from '@/components/ListItem';

const Category: FC = () => {
  const categoryLoadable = useRecoilValueLoadable(primaryCategoryState);

  const checkLoadable = () => {
    log.info('categoryLoadable', categoryLoadable.state);
    log.info('categoryLoadable', categoryLoadable.contents);
  };

  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5" onClick={checkLoadable}>
          单位匹配
        </h1>
        {categoryLoadable.state === 'hasValue' && (
          <>
            <CategoryContent />
          </>
        )}
        {/* {categoryLoadable.state === 'hasError' && <>{categoryLoadable.contents}</>} */}
      </div>
      {categoryLoadable.state === 'hasValue' && (
        <ul className="mdc-list gap-2.5">
          {categoryLoadable.contents.map((item, index) => (
            <ListItem key={item['序号']} title={item['单位']} subtitle={item['姓名']}>
              <p className="mdc-text-heightlight text-xs">{index + 1}</p>
            </ListItem>
            // <div key={item['序号']} className="p-5 bg-sky-200 mt-1 text-black text-base">
            //   {item['姓名']}
            // </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Category;
