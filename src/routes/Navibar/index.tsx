import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import clsx from 'clsx';
import NavButton from './components/NavButton';
import { useNavigate } from 'react-router-dom';
import {
  navIndexState,
  NavIndex,
  dictState,
  subCategoryInfoState,
  matchingRuleState,
  platformState,
} from '@/middleware/store';
import { closeSplashscreen } from '@/api/core';
import { useThemeContext } from '@/components/theme';

// icons
import AdditionFilled from '@/assets/navigations/AdditionFilled';
import BranchFilled from '@/assets/navigations/BranchFilled';
import Addition from '@/assets/navigations/Addition';
import Building from '@/assets/navigations/Building';
import BuildingFilled from '@/assets/navigations/BuildingFilled';
import Branch from '@/assets/navigations/Branch';
import Download from '@/assets/navigations/Download';
import DownloadFilled from '@/assets/navigations/DownloadFilled';
import Info from '@/assets/navigations/Info';
import InfoFilled from '@/assets/navigations/InfoFilled';
import SettingFilled from '@/assets/navigations/SettingFilled';
import Setting from '@/assets/navigations/Setting';

const Navibar = ({ delay, children }: { delay: number; children: ReactNode }) => {
  // preload tauri store
  const preloadMatchingRule = useRecoilValueLoadable(matchingRuleState);
  const preloadSubCategoryInfo = useRecoilValueLoadable(subCategoryInfoState);

  // navibar state
  const [currentIndex, setCurrentIndex] = useRecoilState(navIndexState);
  const nevigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      closeSplashscreen();
    }, delay);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

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

  // navibar ui
  const { themeMode } = useThemeContext();
  const buttonFill = useMemo(() => {
    return themeMode === 'dark' ? '#f2f2f2' : '#696969';
  }, [themeMode]);

  return (
    <div className="h-screen w-screen bg-haruki-200 dark:bg-abyss-900 flex flex-col overflow-hidden relative">
      <div className="w-screen h-3 bg-haruki-200 dark:bg-abyss-900 absolute top-0" />
      <div className="absolute top-3 left-0 right-0 bottom-0 flex flex-row">
        <div className="h-full w-24 bg-haruki-200 dark:bg-abyss-900 flex flex-col justify-between items-center pb-6">
          {/* up */}
          <div className="flex flex-col items-center justify-start gap-3 ">
            <NavButton
              index={NavIndex.Upload}
              currentIndex={currentIndex}
              normalIcon={<Addition theme={themeMode} />}
              activeIcon={<AdditionFilled theme={themeMode} />}
              text="导入"
              setCurrentIndex={setCurrentIndex}
            />
            <NavButton
              index={NavIndex.Category}
              currentIndex={currentIndex}
              normalIcon={<Building theme={themeMode} />}
              activeIcon={<BuildingFilled theme={themeMode} />}
              text="单位"
              setCurrentIndex={setCurrentIndex}
            />
            {preloadSubCategoryInfo.state === 'hasValue' &&
              preloadSubCategoryInfo.contents.available && (
                <NavButton
                  index={NavIndex.SubCategory}
                  currentIndex={currentIndex}
                  normalIcon={<Branch theme={themeMode} />}
                  activeIcon={<BranchFilled theme={themeMode} />}
                  text="班级"
                  setCurrentIndex={setCurrentIndex}
                />
              )}
            <NavButton
              index={NavIndex.Download}
              currentIndex={currentIndex}
              normalIcon={<Download theme={themeMode} />}
              activeIcon={<DownloadFilled theme={themeMode} />}
              text="导出"
              setCurrentIndex={setCurrentIndex}
            />
          </div>
          {/* down */}
          <div className="flex flex-col items-center justify-end gap-3 ">
            <NavButton
              index={NavIndex.About}
              currentIndex={currentIndex}
              normalIcon={<Info theme={themeMode} />}
              activeIcon={<InfoFilled theme={themeMode} />}
              text="关于"
              setCurrentIndex={setCurrentIndex}
            />
            <NavButton
              index={NavIndex.Setting}
              currentIndex={currentIndex}
              normalIcon={<Setting theme={themeMode} />}
              activeIcon={<SettingFilled theme={themeMode} />}
              iconClassName={clsx({
                'animate-spin-slow':
                  preloadSubCategoryInfo === undefined || preloadMatchingRule === undefined,
              })}
              text="设置"
              setCurrentIndex={setCurrentIndex}
            />
          </div>
        </div>
        <div
          className={clsx(
            'rounded-tl-lg h-full w-full overflow-hidden relative',
            'bg-haruki-100 border-t border-l box-border',
            'dark:bg-abyss-750 dark:border-abyss-600 dark:border-opacity-25'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Navibar;
