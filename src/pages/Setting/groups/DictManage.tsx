import clsx from 'clsx';
import type { FC } from 'react';
import { useState, useLayoutEffect, Suspense } from 'react';
import { BookOne, FileSettingsOne } from '@icon-park/react';
import { store, dictState, DICT_SETTING_KEY, dictSizeState } from '@/middleware/store';
import ListItemToggle from '@/components/ListItemToggle';
import ListItemButton from '@/components/ListItemButton';
import log from '@/middleware/logger';
import { useRecoilState, useRecoilValue } from 'recoil';
import { open as openDialog } from '@tauri-apps/api/dialog';
import { open as openShell } from '@tauri-apps/api/shell';
import { importDictionary, getDictPath } from '@/api/core';

const DictManage: FC = () => {
  const [dictEnabled, setDictEnabled] = useRecoilState(dictState);
  const dictSize = useRecoilValue(dictSizeState);

  const checkDictStatus = async () => {
    const val = await store.get(DICT_SETTING_KEY);
    log.info('DictManage checkDictStatus', val);
  };

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
      const data = res as string;
      log.info('DictManage selectFile', data);
    });
  };

  const openDictFolder = async () => {
    const path = (await getDictPath()) as string;
    log.info('DictManage openDictFolder', path);
    const res = await openShell(path);
  };

  return (
    <div className="mdc-item-group">
      <ListItemToggle
        index={0}
        title="启用词典"
        subtitle="启用词典功能后，将基于历史记录构建名词表"
        icon={<BookOne theme="outline" size="30" fill="#fff" />}
        toggleState={dictEnabled}
        setToggleState={setDictEnabled}
        changeHandler={changeHandler}
      />
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
        icon={<FileSettingsOne theme="outline" size="30" fill="#fff" />}
        actionText="查看"
        actionHandler={openDictFolder}
      />
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32" onClick={selectFile}>
          导入名词
        </button>
      </div>
    </div>
  );
};

export default DictManage;
