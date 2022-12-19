/**
 * suspense fallback component
 */
import type { FC } from 'react';
import DataStorage from './groups/DataStorage';
import RuleManage from './groups/RuleManage';
import DictManage from './groups/DictManage';
import PageMotion from '@/components/transition/PageMotion';
import ListItemToggle from '@/components/list/ListItemToggle';
import { useThemeContext } from '@/components/theme';
import DarkMode from '@/assets/descriptions/DarkMode';

const Setting: FC = () => {
  const { themeMode, toggleTheme } = useThemeContext();
  return (
    <PageMotion>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">设置</h1>
        <p className="mdc-text-sm">配置匹配规则，编辑自学习词典，查看应用数据。</p>
      </div>
      <ul className="mdc-list">
        <RuleManage />
        <DictManage />
        <DataStorage />
        <div className="mdc-item-group">
          <ListItemToggle
            index={0}
            title="夜间模式"
            subtitle="设置夜间模式"
            icon={<DarkMode theme={themeMode} />}
            toggleState={themeMode === 'dark'}
            changeHandler={toggleTheme}
          />
        </div>
      </ul>
    </PageMotion>
  );
};

export default Setting;
