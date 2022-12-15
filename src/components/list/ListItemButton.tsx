import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import ListItem from './ListItem';

const ListItemButton: FC<{
  index: number;
  title: string;
  subtitle?: string | ReactNode;
  icon?: ReactNode;
  actionText?: string;
  actionHandler?: (index: number, state?: number) => void;
}> = (props) => {
  const { index, actionText, actionHandler, ...other } = props;

  const handleButtonClick = () => {
    actionHandler && actionHandler(index);
  };

  return (
    <ListItem {...other}>
      <button className="mdc-btn-secondary" onClick={handleButtonClick}>
        <p className="leading-normal">{actionText as string}</p>
      </button>
    </ListItem>
  );
};

export default ListItemButton;
