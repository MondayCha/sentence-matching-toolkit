import type { FC } from 'react';
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

const RuleWindow: FC<{
  records: SubCategoryItem[];
  deleteHandler: (item: SubCategoryItem) => void;
}> = ({ records, deleteHandler }) => {
  const { themeMode } = useThemeContext();

  const Row: FC<ListChildComponentProps<SubCategoryItem[]>> = ({ index, style, data }) => {
    return (
      <BaseRow style={style} title={data[index].sub.company} subTitle={data[index].cat.company}>
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

export default RuleWindow;
