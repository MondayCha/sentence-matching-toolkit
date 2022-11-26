import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValueLoadable } from 'recoil';
import clsx from 'clsx';
// svg
import {
  FileAddition,
  Info,
  SettingTwo,
  FolderDownload,
  BuildingFour,
  BranchOne,
} from '@icon-park/react';
import settingFilled from '@/assets/setting-filled.svg';
import infoFilled from '@/assets/info-filled.svg';
import downloadFilled from '@/assets/download-filled.svg';
import additionFilled from '@/assets/addition-filled.svg';
import buildingFilled from '@/assets/building-filled.svg';
// import { invoke } from "@tauri-apps/api/tauri";
// import { closeSplashscreen } from "../../api/core";
import NavButton from './components/NavButton';
import { useNavigate } from 'react-router-dom';
import { navIndexState, NavIndex, dictState, subCategoryInfoState } from '@/middleware/store';

const Navibar = ({ children }: { children: ReactNode }) => {
  // preload tauri store
  const preloadAutoImportDict = useRecoilValueLoadable(dictState);
  const preloadSubCategoryInfo = useRecoilValueLoadable(subCategoryInfoState);

  // navibar state
  const [currentIndex, setCurrentIndex] = useRecoilState(navIndexState);
  const nevigate = useNavigate();

  // useEffect(() => {
  //   closeSplashscreen();
  // }, []);

  useEffect(() => {
    switch (currentIndex) {
      case NavIndex.Upload:
        nevigate('/');
        break;
      case NavIndex.Category:
        nevigate('/category');
        break;
      case NavIndex.SubCategory:
        nevigate('/subcategory');
        break;
      case NavIndex.Download:
        nevigate('/download');
        break;
      case NavIndex.About:
        nevigate('/about');
        break;
      case NavIndex.Setting:
        nevigate('/setting');
        break;
      default:
        break;
    }
  }, [currentIndex]);

  return (
    <div className="h-screen w-screen bg-white dark:bg-abyss-900 flex flex-col overflow-hidden relative">
      <div className="w-screen h-3 bg-white dark:bg-abyss-900 absolute top-0" />
      <div className="absolute top-3 left-0 right-0 bottom-0 flex flex-row">
        <div className="h-full w-24 bg-white dark:bg-abyss-900 flex flex-col justify-between items-center pb-6">
          {/* up */}
          <div className="flex flex-col items-center justify-start gap-3 ">
            <NavButton
              index={NavIndex.Upload}
              currentIndex={currentIndex}
              normalIcon={<FileAddition theme="outline" size="24" fill="#f2f2f2" />}
              activeIcon={<img src={additionFilled} />}
              text="导入"
              setCurrentIndex={setCurrentIndex}
            />
            <NavButton
              index={NavIndex.Category}
              currentIndex={currentIndex}
              normalIcon={<BuildingFour theme="outline" size="24" fill="#f2f2f2" />}
              activeIcon={<img src={buildingFilled} />}
              text="单位"
              setCurrentIndex={setCurrentIndex}
            />
            {preloadSubCategoryInfo.state === 'hasValue' &&
              preloadSubCategoryInfo.contents.available && (
                <NavButton
                  index={NavIndex.SubCategory}
                  currentIndex={currentIndex}
                  normalIcon={<BranchOne theme="outline" size="24" fill="#f2f2f2" />}
                  activeIcon={<BranchOne theme="filled" size="24" fill="#21b5ff" />}
                  text="班级"
                  setCurrentIndex={setCurrentIndex}
                />
              )}
            <NavButton
              index={NavIndex.Download}
              currentIndex={currentIndex}
              normalIcon={<FolderDownload theme="outline" size="24" fill="#f2f2f2" />}
              activeIcon={<img src={downloadFilled} />}
              text="导出"
              setCurrentIndex={setCurrentIndex}
            />
          </div>
          {/* down */}
          <div className="flex flex-col items-center justify-end gap-3 ">
            <NavButton
              index={NavIndex.About}
              currentIndex={currentIndex}
              normalIcon={<Info theme="outline" size="24" fill="#f2f2f2" />}
              activeIcon={<img src={infoFilled} />}
              text="关于"
              setCurrentIndex={setCurrentIndex}
            />
            <NavButton
              index={NavIndex.Setting}
              currentIndex={currentIndex}
              normalIcon={<SettingTwo theme="outline" size="24" fill="#f2f2f2" />}
              activeIcon={<img src={settingFilled} />}
              iconClassName={clsx({
                'animate-spin-slow':
                  preloadAutoImportDict.state !== 'hasValue' ||
                  preloadSubCategoryInfo.state !== 'hasValue',
              })}
              text="设置"
              setCurrentIndex={setCurrentIndex}
            />
          </div>
        </div>
        <div
          className={clsx(
            'rounded-tl-lg h-full w-full overflow-hidden relative',
            'bg-neutral-100',
            'dark:bg-abyss-750'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Navibar;
