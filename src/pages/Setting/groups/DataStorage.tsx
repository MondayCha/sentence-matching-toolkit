import clsx from 'clsx';
import type { FC } from 'react';
import History from '@/assets/descriptions/History';
import Data from '@/assets/descriptions/Data';
import ListItemButton from '@/components/list/ListItemButton';
import { openHistoryDir, openCacheDir, removeHistoryAndCache } from '@/api/core';
import { showMessage } from '@/middleware/message';
import { useThemeContext } from '@/components/theme';

const DataStorage: FC = () => {
  const { themeMode } = useThemeContext();
  const cleanData = () => {
    removeHistoryAndCache()
      .then(() => {
        showMessage('清理成功', 'info');
      })
      .catch((err) => {
        showMessage(err.message as string, 'error');
      });
  };

  return (
    <div className="mdc-item-group">
      <ListItemButton
        index={0}
        title="历史数据"
        subtitle="匹配产生的中间文件"
        icon={<History theme={themeMode} />}
        actionText="浏览"
        actionHandler={openHistoryDir}
      />
      <ListItemButton
        index={0}
        title="缓存数据"
        subtitle="分词、关系等随使用产生的数据"
        icon={<Data theme={themeMode} />}
        actionText="浏览"
        actionHandler={openCacheDir}
      />
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32" onClick={cleanData}>
          清除数据
        </button>
      </div>
    </div>
  );
};

export default DataStorage;
