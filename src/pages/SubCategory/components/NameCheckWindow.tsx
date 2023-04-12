import { FC, useEffect, useState } from 'react';
import clsx from 'clsx';
import { SubCategoryItem } from '@/api/core';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import PlaceHolder from './PlaceHolder';
import { useThemeContext } from '@/components/theme';
import Edit from '@/assets/operations/Edit';
import Delete from '@/assets/operations/Delete';
import BaseRow from './BaseRow';
import ListMotion from '@/components/transition/ListMotion';
import { useDebounce } from 'usehooks-ts';

const getName = (item: SubCategoryItem) => {
  if (item.nameFlag == 'Doubt') {
    return item.sub.name?.split('|')[1];
  }
  return item.sub.name;
};

const NameCheckWindow: FC<{
  records: SubCategoryItem[];
  modifyHandler: (item: SubCategoryItem, newName: string) => void;
  deleteHandler: (item: SubCategoryItem) => void;
}> = ({ records, modifyHandler, deleteHandler }) => {
  const { themeMode } = useThemeContext();

  const Row: FC<ListChildComponentProps<SubCategoryItem[]>> = ({ index, style, data }) => {
    const [name, setName] = useState(data[index].sub.name);
    const debouncedName = useDebounce(name, 500);

    useEffect(() => {
      if (data[index].sub.name !== debouncedName) {
        modifyHandler(data[index], debouncedName);
      }
    }, [debouncedName]);

    return (
      <BaseRow style={style} title={data[index].raw.name} subTitle={data[index].raw.company}>
        {data[index].nameFlag === 'Doubt' ? (
          <>
            <button
              placeholder="获取失败"
              className="mdc-btn-secondary mdc-text-xs h-8 px-2 w-fit flex items-center justify-center"
              onClick={() => {
                setName(data[index].nameCalc);
              }}
            >
              {data[index].nameCalc}
            </button>
            <input
              type="text"
              value={name}
              placeholder="获取失败"
              className="bg-haruki-50 border leading-none mdc-text-xs rounded focus:border-primary-light-400 block w-48 px-4 h-8 placeholder-zinc-400 dark:bg-abyss-600 dark:hover:brightness-110 dark:border-abyss-500 dark:placeholder-zinc-400 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              autoCapitalize="off"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </>
        ) : (
          <input
            type="text"
            value={name}
            placeholder="获取失败"
            className="bg-haruki-50 border leading-none mdc-text-xs rounded focus:border-primary-light-400 block w-48 px-4 h-8 placeholder-zinc-400 dark:bg-abyss-600 dark:hover:brightness-110 dark:border-abyss-500 dark:placeholder-zinc-400 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        )}
        <button className="mdc-btn-secondary h-8 w-8 flex items-center justify-center">
          <Delete theme={themeMode} onClick={() => deleteHandler(data[index])} />
        </button>
      </BaseRow>
    );
  };

  return (
    <ListMotion>
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
        <PlaceHolder themeMode={themeMode} />
      )}
    </ListMotion>
  );
};

export default NameCheckWindow;
