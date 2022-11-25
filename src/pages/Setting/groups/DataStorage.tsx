import clsx from 'clsx';
import type { FC } from 'react';
import ListItem from '../../../components/ListItem';
import { History, Data, DownloadComputer } from '@icon-park/react';
import ListItemButton from '../../../components/ListItemButton';
import { openHistoryDir, openCacheDir } from '@/api/core';

const DataStorage: FC = () => {
  return (
    <div className="mdc-item-group">
      <ListItemButton
        index={0}
        title="历史数据"
        subtitle="每次统计的结果，可用于数据分析"
        icon={<History theme="outline" size="30" fill="#fff" />}
        actionText="浏览"
        actionHandler={openHistoryDir}
      />
      <ListItemButton
        index={0}
        title="缓存数据"
        subtitle="分词、关系等随使用产生的数据"
        icon={<Data theme="outline" size="30" fill="#fff" />}
        actionText="浏览"
        actionHandler={openCacheDir}
      />
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32">清除数据</button>
      </div>
    </div>
  );
};

export default DataStorage;
