import DownloadComputer from '@/assets/descriptions/DownloadComputer';
import { useThemeContext } from '@/components/theme';
import clsx from 'clsx';
import type { FC } from 'react';
import ListItemButton from '@/components/list/ListItemButton';
import PageMotion from '@/components/transition/PageMotion';

const Download: FC = () => {
  const { themeMode } = useThemeContext();
  return (
    <PageMotion>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">导出</h1>
        <p className="mdc-text-sm">导出全校统计和各班级数据统计，并复制 VBA 样式代码。</p>
      </div>
      <ul className="mdc-list">
        <ListItemButton
          index={0}
          title="数据导出位置"
          subtitle="C:\Users\username\Documents\"
          icon={<DownloadComputer theme={themeMode} />}
          actionText="浏览"
          actionHandler={() => {}}
        />
      </ul>
    </PageMotion>
  );
};

export default Download;
