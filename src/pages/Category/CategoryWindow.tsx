/**
 * How to type the index and style props passed to Row function using React-Window?
 * @see {@link https://stackoverflow.com/a/74191187/17335458}
 */
import type { FC, CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DataAll } from '@icon-park/react';
import IconNotFound from '@/assets/not-found';
import { SourceRecord } from '@/api/core';

const CategoryWindow: FC<{
  records: SourceRecord[];
  actionTag: string;
  actionHandler: (index: number) => void;
}> = ({ records, actionTag, actionHandler }) => {
  const Row: FC<ListChildComponentProps<SourceRecord[]>> = ({ index, style, data }) => (
    <div className="pr-6 lg:pr-8" style={style}>
      <div className="mdc-item h-16">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-row justify-start items-center space-x-3 2xl:space-x-4">
            <div className="flex flex-col space-y-2">
              <span className="mdc-text-sm text-zinc-200 font-medium leading-none">
                {data[index].company}
              </span>
              <span className="mdc-text-xs leading-none text-xs">{data[index].name}</span>
            </div>
          </div>
          <button className="mdc-btn-secondary" onClick={() => actionHandler(data[index].index)}>
            <p className="leading-normal">{actionTag}</p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {records.length > 0 ? (
        <div className="mdc-body h-full pr-0">
          <AutoSizer>
            {({ height, width }) => (
              <List
                className={clsx('List mdc-scroolbar')}
                height={height}
                itemCount={records.length}
                itemSize={74}
                width={width}
                itemData={records}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      ) : (
        <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
          <div className="w-full h-full">
            <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
              <IconNotFound />
              <p className="mdc-text-sm text-center">该列表目前没有项目</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryWindow;
