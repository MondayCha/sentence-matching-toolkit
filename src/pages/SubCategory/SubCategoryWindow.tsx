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
import { useThemeContext } from '@/components/theme';
import Delete from '@/assets/operations/Delete';
import Edit from '@/assets/operations/Edit';
import IconNotFound from '@/assets/illustrations/NotFound';
import { SourceRecord } from '@/api/core';

const SubCategoryWindow: FC<{
  records: SourceRecord[];
  actionTag: string;
  actionHandler: (index: number) => void;
}> = ({ records, actionTag, actionHandler }) => {
  const { themeMode } = useThemeContext();

  const Row: FC<ListChildComponentProps<SourceRecord[]>> = ({ index, style, data }) => {
    const title =
      data[index].parsedClass?.[2].replace(data[index].parsedName ?? ' ', ' ').trim() ??
      data[index].company;

    return (
      <div className="pr-6 lg:pr-8" style={style}>
        <div className="mdc-item h-16">
          <div className="flex flex-row justify-between items-start">
            <div className="flex flex-row justify-start items-center space-x-3 2xl:space-x-4 w-2/5 overflow-hidden">
              <div className="flex flex-col space-y-2 w-full">
                <span className="mdc-text-sm leading-none text-ellipsis overflow-hidden whitespace-nowrap w-full select-text">
                  {title}
                </span>
                <span className="mdc-text-xs leading-none text-xs">
                  {data[index].parsedClass
                    ? data[index].parsedName ?? data[index].name
                    : data[index].name}
                </span>
              </div>
            </div>
            <div className="flex flex-row items-center justify-end space-x-2">
              {!!data[index].matchedClass && (
                <div
                  className="mdc-btn-secondary w-fit px-3 select-none cursor-pointer h-8"
                  onClick={() => actionHandler(data[index].index)}
                >
                  <p className="leading-normal">{data[index].matchedClass}</p>
                </div>
              )}
              <button className="mdc-btn-secondary h-8 w-8 flex items-center justify-center">
                <Edit isDark={themeMode === 'dark'} />
              </button>
              <button className="mdc-btn-secondary h-8 w-8 flex items-center justify-center">
                <Delete isDark={themeMode === 'dark'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <IconNotFound isDark={themeMode === 'dark'} />
              <p className="mdc-text-sm text-center">该列表目前没有项目</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubCategoryWindow;
