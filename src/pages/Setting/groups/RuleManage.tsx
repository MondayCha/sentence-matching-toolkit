import clsx from 'clsx';
import type { FC } from 'react';
import ListItemButton from '../../../components/ListItemButton';
import { Agreement, OneKey, TwoKey } from '@icon-park/react';

const RuleManage: FC = () => {
  return (
    <div className="mdc-item-group">
      <ListItemButton
        index={0}
        title="当前规则配置"
        subtitle={
          <p>
            规则「
            <span className="mdc-text-heightlight">山南市职业技术学校</span>
            」生效中
          </p>
        }
        icon={<Agreement theme="outline" size="30" fill="#fff" />}
        actionText="浏览"
        actionHandler={() => {}}
      />
      <ListItemButton
        index={0}
        title="一级匹配"
        subtitle="设置模糊匹配关键词、精确匹配关键词"
        icon={<OneKey theme="outline" size="30" fill="#fff" />}
        actionText="浏览"
        actionHandler={() => {}}
      />
      <ListItemButton
        index={0}
        title="二级匹配"
        subtitle="请提供二级匹配列表"
        icon={<TwoKey theme="outline" size="30" fill="#fff" />}
        actionText="浏览"
        actionHandler={() => {}}
      />
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32">导出配置</button>
      </div>
    </div>
  );
};

export default RuleManage;
