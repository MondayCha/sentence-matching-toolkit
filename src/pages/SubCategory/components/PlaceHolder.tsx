import type { FC } from 'react';
import NotFound from '@/assets/illustrations/NotFound';
import { useThemeContext } from '@/components/theme';
import { ThemeMode } from '@/middleware/store';

const PlaceHolder: FC<{ themeMode: ThemeMode }> = ({ themeMode }) => {
  return (
    <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
      <div className="w-full h-full">
        <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
          <NotFound theme={themeMode} />
          <p className="mdc-text-sm text-center">该列表目前没有项目</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceHolder;
