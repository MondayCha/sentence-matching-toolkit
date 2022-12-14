import clsx from 'clsx';
import type { FC } from 'react';
import ListItemButton from '../../../components/ListItemButton';
import Agreement from '@/assets/descriptions/Agreement';
import Focus from '@/assets/descriptions/Focus';
import { useRecoilState } from 'recoil';
import { subCategoryInfoState, matchingRuleState } from '@/middleware/store';
import { open as openDialog } from '@tauri-apps/api/dialog';
import { loadMatchingRule, loadSubCategoryCSV } from '@/api/core';
import log from '@/middleware/logger';
import { useThemeContext } from '@/components/theme';

const RuleManage: FC = () => {
  const { themeMode } = useThemeContext();
  const [matchingRule, setMatchingRule] = useRecoilState(matchingRuleState);
  const [subCategoryInfo, setSubCategoryInfo] = useRecoilState(subCategoryInfoState);

  const loadCategory = async () => {
    const selected = await openDialog({
      multiple: false,
      filters: [
        {
          name: 'JSON',
          extensions: ['json', 'JSON'],
        },
      ],
    });

    let fullPath = '';
    if (Array.isArray(selected)) {
      fullPath = selected[0];
    } else if (selected === null) {
      return;
    } else {
      fullPath = selected;
    }

    loadMatchingRule(fullPath)
      .then((res) => {
        const name = res as string;
        setMatchingRule({ name });
        log.info('Rule selectFile', name);
      })
      .catch((err) => {
        log.error('Rule selectFile', err);
        setMatchingRule({ name: '' });
      });
  };

  const loadSubCategory = async () => {
    const selected = await openDialog({
      multiple: false,
      filters: [
        {
          name: 'CSV',
          extensions: ['csv', 'CSV'],
        },
      ],
    });

    let fullPath = '';
    if (Array.isArray(selected)) {
      fullPath = selected[0];
    } else if (selected === null) {
      return;
    } else {
      fullPath = selected;
    }

    loadSubCategoryCSV(fullPath)
      .then((res) => {
        const name = res as string;
        setSubCategoryInfo({ name, available: true });
        log.info('Rule selectFile', name);
      })
      .catch((err) => {
        log.error('Rule selectFile', err);
        setSubCategoryInfo({ name: '', available: false });
      });
  };

  return (
    <div className="mdc-item-group">
      <ListItemButton
        index={0}
        title="当前规则"
        subtitle={
          <>
            {matchingRule.name.length > 0 ? (
              <p>
                规则「
                <span className="mdc-text-heightlight">{matchingRule.name}</span>
                」生效中
              </p>
            ) : (
              <p>请导入基本匹配规则，通常由开发者提供</p>
            )}
          </>
        }
        icon={<Agreement theme={themeMode} />}
        actionText="导入"
        actionHandler={loadCategory}
      />
      <ListItemButton
        index={0}
        title="班级匹配"
        subtitle={
          <>
            {subCategoryInfo.available ? (
              <p>
                列表「
                <span className="mdc-text-heightlight">{subCategoryInfo.name}</span>
                」生效中
              </p>
            ) : (
              <p>提供班级列表后，可进一步对人员分组</p>
            )}
          </>
        }
        icon={<Focus theme={themeMode} />}
        actionText="导入"
        actionHandler={loadSubCategory}
      />
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32">导出规则</button>
      </div>
    </div>
  );
};

export default RuleManage;
