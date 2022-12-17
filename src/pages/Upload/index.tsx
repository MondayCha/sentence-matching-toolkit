import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { open } from '@tauri-apps/api/dialog';
import clsx from 'clsx';
import log from '@/middleware/logger';
import { showMessage, showConfirm } from '@/middleware/message';
import { AppStatus, checkCsvAvailability } from '@/api/core';
import IconLoadFile from '@/assets/illustrations/NoFile';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  navIndexState,
  NavIndex,
  sourceFilePathState,
  appStatusState,
  categoryUpdateTriggerState,
} from '@/middleware/store';
import { getTimestamp } from '@/middleware/utils';
import { useThemeContext } from '@/components/theme';
import PageMotion from '@/components/transition/PageMotion';
import Processing from '@/assets/illustrations/Processing';
import Collaboration from '@/assets/illustrations/Collaboration';

const Upload: FC = () => {
  const [appStatus, setAppStatus] = useRecoilState(appStatusState);
  const { themeMode } = useThemeContext();
  const setNavIndex = useSetRecoilState(navIndexState);
  const setCategoryUpdateTrigger = useSetRecoilState(categoryUpdateTriggerState);
  const [sourcePath, setSourcePath] = useRecoilState(sourceFilePathState);

  const selectFile = async () => {
    if (appStatus === AppStatus.NoRule) {
      showConfirm('当前不存在有效的匹配规则，请先在「设置」中导入规则文件', 'warning').then(
        (res) => {
          if (res) {
            setNavIndex(NavIndex.Setting);
          }
        }
      );
      return;
    }

    // appStatus >= AppStatus.Idle

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
        filename: '',
        timestamp: getTimestamp(),
      });
      return;
    } else {
      fullPath = selected;
    }

    checkCsvAvailability(fullPath)
      .then((res) => {
        const filename = res as string;
        log.info(filename);
        setSourcePath({
          path: fullPath,
          filename,
          timestamp: getTimestamp(),
        });
      })
      .catch((err) => {
        log.error(err);
        showMessage(err, 'warning');
        setSourcePath({
          path: '',
          filename: '',
          timestamp: getTimestamp(),
        });
        setAppStatus(AppStatus.Idle);
      });
  };

  const navigateToCatrgory = () => {
    setAppStatus(AppStatus.CanMatchCompany);
    setCategoryUpdateTrigger(getTimestamp());
    setNavIndex(NavIndex.Category);
  };

  return (
    <PageMotion>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">短文本匹配工具</h1>
        {appStatus === AppStatus.NoRule ? (
          <p className="mdc-text-sm">未检测到有效的匹配规则，请先在「设置」中导入规则文件。</p>
        ) : (
          <p className="mdc-text-sm">输入待统计的数据，软件将根据规则配置文件，输出匹配结果。</p>
        )}
      </div>
      <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
        <div
          className="mdc-item py-12 h-full w-full flex flex-col items-center justify-center space-y-3 cursor-pointer"
          onClick={selectFile}
        >
          {!!sourcePath.filename ? (
            <Collaboration className="h-64 lg:h-72" theme={themeMode} />
          ) : (
            <IconLoadFile className="h-64 lg:h-72" theme={themeMode} />
          )}

          <p className="mdc-text-sm text-center">
            {!!sourcePath.filename ? (
              <>
                已导入「<span className="mdc-text-heightlight">{sourcePath.filename}</span>」
              </>
            ) : (
              '点击这里，导入需要统计的文件（支持 *.csv 格式）'
            )}
          </p>
        </div>
        {!!sourcePath.filename && (
          <button className="mdc-btn-primary p-1 w-32" onClick={navigateToCatrgory}>
            开始统计
          </button>
        )}
      </div>
    </PageMotion>
  );
};

export default Upload;
