import clsx from 'clsx';
import type { FC } from 'react';
import ListItem from '../../../components/ListItem';
import { History, Data, DownloadComputer } from '@icon-park/react';
import ListItemButton from '../../../components/ListItemButton';

const DataStorage: FC = () => {
  return (
    <div className="mdc-item-group">
      <ListItemButton
        index={0}
        title="历史数据存储位置"
        subtitle="C:\Users\username\Documents\"
        icon={<History theme="outline" size="30" fill="#fff" />}
        actionText="浏览"
        actionHandler={() => {}}
      />
      <ListItemButton
        index={0}
        title="缓存数据存储位置"
        subtitle="C:\Users\username\Documents\"
        icon={<Data theme="outline" size="30" fill="#fff" />}
        actionText="浏览"
        actionHandler={() => {}}
      />

      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32">清除历史</button>
      </div>
    </div>
  );
};

export default DataStorage;
