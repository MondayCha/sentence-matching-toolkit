import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import Searching from '@/assets/illustrations/Searching';
import Pending from '@/assets/illustrations/Pending';
import { useThemeContext } from '../theme';

const IdlePlaceholder: FC<{
  isMatching: boolean;
  idlePlaceholder: string;
  matchingPlaceholder: string;
}> = ({ isMatching, idlePlaceholder, matchingPlaceholder }) => {
  const { themeMode } = useThemeContext();
  return (
    <div className="mdc-body grow flex flex-col gap-4 overflow-hidden justify-between items-end">
      <div className="mdc-item py-12 grow">
        <div className="flex h-full w-full flex-col items-center justify-center space-y-3 ">
          {isMatching ? <Searching theme={themeMode} /> : <Pending theme={themeMode} />}
          <p className="mdc-text-sm text-center">
            {isMatching ? matchingPlaceholder : idlePlaceholder}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IdlePlaceholder;
