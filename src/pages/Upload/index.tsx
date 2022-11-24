import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { open } from '@tauri-apps/api/dialog';
import clsx from 'clsx';
import log from '@/middleware/logger';
import { showMessage } from '@/middleware/message';
import { checkCsvAvailability } from '@/api/core';
import moment from 'moment';
import IconLoadFile from './load-file';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  navIndexState,
  NavIndex,
  sourceFilePathState,
  getSourceFilename,
} from '@/middleware/store';

const Home: FC = () => {
  const [sourcePath, setSourcePath] = useRecoilState(sourceFilePathState);
  const [today] = useState(moment().format('MM-DD'));
  const setNavIndex = useSetRecoilState(navIndexState);
  const sourceBaseName = useRecoilValue(getSourceFilename);

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
      setSourcePath('');
      return;
    } else {
      fullPath = selected;
    }

    checkCsvAvailability(fullPath)
      .then((res) => {
        const data = res as string;
        log.info(data);
        setSourcePath(fullPath);
      })
      .catch((err) => {
        log.error(err);
        setSourcePath('');
      });
  };

  const navigateToCatrgory = () => {
    if (sourcePath === '') {
      showMessage('请先选择文件', 'warning');
      return;
    }
    setNavIndex(NavIndex.Category);
  };

  return (
    <div className="mdc-paper">
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">短文本匹配工具</h1>
        <p className="mdc-text-sm">
          输入待统计的数据（例如：
          <span className="mr-0.5">{today} 山南.csv</span>
          ）。
        </p>
        <p className="mdc-text-sm">软件将根据规则配置文件 ，输出匹配结果。</p>
      </div>
      <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
        <div className="mdc-item py-12 grow">
          <div
            className="flex h-full w-full flex-col items-center justify-center space-y-3 cursor-pointer"
            onClick={selectFile}
          >
            <IconLoadFile />
            <div>
              <p className="mdc-text-sm text-center">
                {!sourceBaseName ? (
                  '点击这里，导入需要统计的文件（支持 *.csv 格式）'
                ) : (
                  <>
                    已导入「<span className="mdc-text-heightlight">{sourceBaseName}</span>」
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        {!!sourceBaseName && (
          <button className="mdc-btn-primary p-1 w-32" onClick={navigateToCatrgory}>
            开始统计
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
