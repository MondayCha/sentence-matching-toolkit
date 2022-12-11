import clsx from 'clsx';
import type { FC } from 'react';
import Book from '@/assets/descriptions/Book';
import FileSetting from '@/assets/descriptions/FileSetting';
import { store, dictState, DICT_SETTING_KEY, dictSizeState } from '@/middleware/store';
import ListItemToggle from '@/components/ListItemToggle';
import ListItemButton from '@/components/ListItemButton';
import log from '@/middleware/logger';
import { useRecoilState } from 'recoil';
import { open as openDialog } from '@tauri-apps/api/dialog';
import { open as openShell } from '@tauri-apps/api/shell';
import { importDictionary, getDictPath } from '@/api/core';
import { getTimestamp } from '@/middleware/utils';
import { useThemeContext } from '@/components/theme';

const DictManage: FC = () => {
  const [dictEnabled, setDictEnabled] = useRecoilState(dictState);
  const [dictSize, setDictSize] = useRecoilState(dictSizeState);
  const { themeMode, toggleTheme } = useThemeContext();

  const changeHandler = async (index: number, state: boolean) => {
    await store.set(DICT_SETTING_KEY, state);
    setDictEnabled(state);
  };

  const selectFile = async () => {
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

    importDictionary(fullPath).then((res) => {
      const size = res as number;
      log.info('DictManage selectFile', size);
      setDictSize(size);
    });
  };

  const openDictFolder = async () => {
    const path = (await getDictPath()) as string;
    log.info('DictManage openDictFolder', path);
    const res = await openShell(path);
  };

  return (
    <div className="mdc-item-group">
      <ListItemButton
        index={0}
        title="词典状态"
        subtitle={
          <p>
            已收集
            <span className="mdc-text-heightlight">{dictSize}</span>
            条名词
            {/* <span className="mdc-text-heightlight">200</span>
            条关系 */}
          </p>
        }
        icon={<FileSetting isDark={themeMode === 'dark'} />}
        actionText="编辑"
        actionHandler={openDictFolder}
      />
      <ListItemToggle
        index={0}
        title="自动导入"
        subtitle="导出匹配结果时，同时将新名词添加到词典"
        icon={<Book isDark={themeMode === 'dark'} />}
        toggleState={dictEnabled}
        changeHandler={changeHandler}
      />
      <ListItemToggle
        index={0}
        title="夜间模式"
        subtitle="设置夜间模式"
        icon={<Book isDark={themeMode === 'dark'} />}
        toggleState={themeMode === 'dark'}
        changeHandler={toggleTheme}
      />
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32" onClick={selectFile}>
          导入词典
        </button>
      </div>
    </div>
  );
};

export default DictManage;
