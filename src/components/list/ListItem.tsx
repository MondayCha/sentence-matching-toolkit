import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';

const ListItem: FC<{
  title: string;
  subtitle?: string | ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}> = (props) => {
  const { title, subtitle, icon, children } = props;

  return (
    <li className="mdc-item">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start items-center space-x-3 2xl:space-x-4">
          {icon && icon}
          <div className="flex flex-col space-y-2">
            <span className="mdc-text-sm font-medium leading-none">{title}</span>
            {subtitle && <span className="mdc-text-xs leading-none">{subtitle}</span>}
          </div>
        </div>
        {children && children}
      </div>
    </li>
  );
};

export default ListItem;
