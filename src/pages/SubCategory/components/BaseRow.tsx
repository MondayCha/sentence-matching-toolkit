import type { FC, ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';

const BaseRow: FC<{
  style: React.CSSProperties;
  title?: string;
  subTitle?: string;
  children?: ReactNode;
}> = ({ style, title, subTitle, children }) => {
  return (
    <div className="pr-6 lg:pr-8" style={style}>
      <div className="mdc-item h-16">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row justify-start items-center w-2/5 overflow-hidden">
            <div className="flex flex-col space-y-2 w-full">
              {!!title && title.length > 0 && (
                <p className="mdc-text-sm leading-none text-ellipsis overflow-hidden whitespace-nowrap w-full select-text">
                  {title}
                </p>
              )}

              <p className="mdc-text-xs leading-none text-xs">
                {!!subTitle && subTitle.length > 0 ? (
                  subTitle
                ) : (
                  <span className="mdc-text-heightlight">获取失败</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-end space-x-2">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default BaseRow;
