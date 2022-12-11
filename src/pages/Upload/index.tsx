import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { open } from '@tauri-apps/api/dialog';
import clsx from 'clsx';
import log from '@/middleware/logger';
import { showMessage } from '@/middleware/message';
import { AppStatus, checkCsvAvailability } from '@/api/core';
import IconLoadFile from '@/assets/illustrations/NoFile';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  navIndexState,
  NavIndex,
  sourceFilePathState,
  getSourceFilename,
  appStatusState,
} from '@/middleware/store';
import { getTimestamp } from '@/middleware/utils';
import { useThemeContext } from '@/components/theme';

const Home: FC = () => {
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const { themeMode } = useThemeContext();
  const filename = useRecoilValue(getSourceFilename);
  const setNavIndex = useSetRecoilState(navIndexState);
  const setSourcePath = useSetRecoilState(sourceFilePathState);

  const selectFile = async () => {
    const selected = await open({
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
      // showMessage("没有选择文件", "warning");
      setSourcePath({
        path: '',
        timestamp: getTimestamp(),
      });
      return;
    } else {
      fullPath = selected;
    }

    checkCsvAvailability(fullPath)
      .then((res) => {
        const data = res as string;
        log.info(data);
        setSourcePath({
          path: fullPath,
          timestamp: getTimestamp(),
        });
        setAppStatus(AppStatus.CanMatch1);
      })
      .catch((err) => {
        log.error(err);
        setSourcePath({
          path: '',
          timestamp: getTimestamp(),
        });
        setAppStatus(AppStatus.Idle);
      });
  };

  const navigateToCatrgory = () => {
    if (appStatus === AppStatus.Idle) {
      showMessage('请先选择文件', 'warning');
      return;
    }
    setNavIndex(NavIndex.Category);
  };

  return (
    <div className="mdc-paper">
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">短文本匹配工具</h1>
        <p className="mdc-text-sm">输入待统计的数据，软件将根据规则配置文件，输出匹配结果。</p>
      </div>
      <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
        <div className="mdc-item py-12 grow">
          <div
            className="flex h-full w-full flex-col items-center justify-center space-y-3 cursor-pointer"
            onClick={selectFile}
          >
            <IconLoadFile className="h-64 lg:h-72" isDark={themeMode === 'dark'} />
            <div>
              <p className="mdc-text-sm text-center">
                {!filename ? (
                  '点击这里，导入需要统计的文件（支持 *.csv 格式）'
                ) : (
                  <>
                    已导入「<span className="mdc-text-heightlight">{filename}</span>」
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        {!!filename && (
          <button className="mdc-btn-primary p-1 w-32" onClick={navigateToCatrgory}>
            开始统计
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
