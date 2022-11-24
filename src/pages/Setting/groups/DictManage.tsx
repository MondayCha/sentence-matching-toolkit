import clsx from 'clsx';
import type { FC } from 'react';
import { BookOne, FileSettingsOne } from '@icon-park/react';
import { store } from '@/routes/RouterView';
import { useState, useLayoutEffect } from 'react';
import ListItemToggle from '@/components/ListItemToggle';
import ListItemButton from '@/components/ListItemButton';
import { useLocalStorage } from 'usehooks-ts';
import log from '@/middleware/logger';

const DICT_SETTING_KEY = 'dictionary';

const DictManage: FC = () => {
  const [dictStatusCache, setDictStatusCache] = useLocalStorage<boolean>('dictEnabled', true);
  const [dictEnabled, setDictEnabled] = useState<boolean>(dictStatusCache);

  const readDictStatus = async () => {
    const val = await store.get(DICT_SETTING_KEY);
    return val === true;
  };

  useLayoutEffect(() => {
    log.info('DictManage useEffect');
    readDictStatus().then((val) => {
      log.info('DictManage useEffect readDictStatus', val);
      if (val !== dictStatusCache) {
        setDictEnabled(val);
        setDictStatusCache(val);
      }
    });
  }, [dictStatusCache]);

  const checkDictStatus = async () => {
    const val = await store.get(DICT_SETTING_KEY);
    log.info('DictManage checkDictStatus', val);
  };

  const changeHandler = async (index: number, state: boolean) => {
    await store.set(DICT_SETTING_KEY, state);
    setDictStatusCache(state);
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
            <span className="mdc-text-heightlight">200</span>
            条名词，
            <span className="mdc-text-heightlight">200</span>
            条关系
          </p>
        }
        icon={<FileSettingsOne theme="outline" size="30" fill="#fff" />}
        actionText="查看"
        actionHandler={() => {}}
      />
      <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
        <button className="mdc-btn-primary p-1 w-32" onClick={checkDictStatus}>
          导入名词
        </button>
      </div>
    </div>
  );
};

export default DictManage;
