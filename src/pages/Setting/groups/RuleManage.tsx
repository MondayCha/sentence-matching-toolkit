import clsx from 'clsx';
import type { FC } from 'react';
import ListItemButton from '../../../components/ListItemButton';
import { Agreement, Focus, Min } from '@icon-park/react';
import { useRecoilState } from 'recoil';
import { subCategoryInfoState } from '@/middleware/store';

const RuleManage: FC = () => {
  const [subCategoryInfo, setSubCategoryInfo] = useRecoilState(subCategoryInfoState);

  return (
    <div className="mdc-item-group">
      <ListItemButton
        index={0}
        title="当前规则"
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
        title="班级匹配"
        subtitle="提供班级列表后，可进一步对人员分组"
        icon={<Focus theme="outline" size="30" fill="#fff" />}
        actionText="导入"
        actionHandler={() => {}}
      />
      {subCategoryInfo.available && (
        <ListItemButton
          index={0}
          title="相似阈值"
          subtitle="设置较低值和较高值，可提高匹配准确率"
          icon={<Min theme="outline" size="30" fill="#fff" />}
          actionText="0.25 0.75"
          actionHandler={() => {}}
        />
      )}
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32">导出规则</button>
      </div>
    </div>
  );
};

export default RuleManage;
