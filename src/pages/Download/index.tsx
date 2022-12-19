import DownloadComputer from '@/assets/descriptions/DownloadComputer';
import { useThemeContext } from '@/components/theme';
import clsx from 'clsx';
import { FC, useMemo, useState } from 'react';
import ListItemButton from '@/components/list/ListItemButton';
import PageMotion from '@/components/transition/PageMotion';
import Excel from '@/assets/descriptions/Excel';
import { appStatusState, getIsWin32, sourceFilePathState } from '@/middleware/store';
import { useRecoilValue } from 'recoil';
import { writeText } from '@tauri-apps/api/clipboard';
import { sep } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/api/dialog';
import { open as openFolder } from '@tauri-apps/api/shell';
import { AppStatus, exportSubCategory, getVbaSnippet } from '@/api/core';
import { showMessage } from '@/middleware/message';

const Download: FC = () => {
  const { themeMode } = useThemeContext();
  const appStatus = useRecoilValue(appStatusState);
  const sourcePath = useRecoilValue(sourceFilePathState);
  const isWin32 = useRecoilValue(getIsWin32);
  const [outputDir, setOutputDir] = useState<string>(sourcePath.parent + sep);

  // if outputDir.length > 60, clip it in ...outputDir
  const clippedOutputDir = useMemo(() => {
    if (outputDir.length > 57) {
      return `...${outputDir.slice(outputDir.length - 60)}`;
    }
    return outputDir;
  }, [outputDir]);

  const handleExport = async () => {
    try {
      const folder = await exportSubCategory(outputDir, isWin32);
      await openFolder(folder);
    } catch (error) {
      showMessage(error, 'error');
    }
  };

  const handleCopy = async () => {
    try {
      const code = await getVbaSnippet();
      writeText(code);
      showMessage('复制成功', 'info');
    } catch {
      showMessage('复制失败', 'error');
    }
  };

  return (
    <PageMotion>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">导出</h1>
        <p className="mdc-text-sm">导出全校统计和各班级数据统计，并复制 VBA 样式代码。</p>
      </div>
      <ul className="mdc-list">
        <div className="mdc-item-group">
          <ListItemButton
            index={0}
            title="数据导出位置"
            subtitle={!!sourcePath.parent ? clippedOutputDir : '未选择数据源'}
            icon={<DownloadComputer theme={themeMode} />}
            actionText="浏览"
            actionHandler={async () => {
              if (!!sourcePath.parent) {
                const selected = await open({
                  directory: true,
                  multiple: false,
                  defaultPath: outputDir,
                });
                if (Array.isArray(selected)) {
                  // user selected multiple directories
                  setOutputDir(selected[0] + sep);
                } else if (selected === null) {
                  // user cancelled the selection
                } else {
                  // user selected a single directory
                  setOutputDir(selected + sep);
                }
              } else {
                showMessage('请先选择数据源', 'error');
              }
            }}
          />
          <ListItemButton
            index={0}
            title="样式宏"
            subtitle={
              <>
                使用<span className="mdc-text-heightlight">VBA</span>代码，快速自定义
                <span className="mdc-text-heightlight">Excel</span>样式
              </>
            }
            icon={<Excel theme={themeMode} />}
            actionText="复制"
            actionHandler={handleCopy}
          />
          {!!sourcePath.parent && appStatus === AppStatus.ExportWithClass && (
            <div className="mt-1.5 mr-4 flex flex-row space-x-2.5">
              <button className="mdc-btn-primary" onClick={handleExport}>
                导出数据
              </button>
            </div>
          )}
        </div>
      </ul>
    </PageMotion>
  );
};

export default Download;
