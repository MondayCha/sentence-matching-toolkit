/**
 * @see {@link https://flowbite.com/docs/forms/toggle/}
 */
import clsx from 'clsx';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useState } from 'react';
import ListItem from './ListItem';

const ListItemToggle: FC<{
  index: number;
  title: string;
  subtitle?: string | ReactNode;
  icon?: ReactNode;
  toggleState: boolean;
  changeHandler?: (index: number, state: boolean) => void;
}> = (props) => {
  const { index, toggleState, changeHandler, ...other } = props;

  return (
    <ListItem {...other}>
      <label className="inline-flex relative items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          checked={toggleState}
          key={index}
          className="sr-only peer"
          onChange={(e) => {
            changeHandler && changeHandler(index, e.target.checked);
          }}
        />
        <div
          className={clsx(
            'w-11 h-6 rounded-full peer dark:bg-abyss-700',
            'bg-white',
            'dark:border-white border box-border border-abyss-500',
            "after:content-[''] after:absolute after:top-[4px] after:left-[4px] dark:after:bg-white after:bg-abyss-500 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all",
            'peer-checked:after:translate-x-5 peer-checked:after:border-white dark:peer-checked:after:border-abyss-700 peer-checked:after:bg-white dark:peer-checked:after:bg-abyss-700 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark peer-checked:border-none'
          )}
        ></div>
      </label>
    </ListItem>
  );
};

export default ListItemToggle;
