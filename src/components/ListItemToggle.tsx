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
  setToggleState: Dispatch<SetStateAction<boolean>>;
  changeHandler?: (index: number, state: boolean) => void;
}> = (props) => {
  const { index, toggleState, setToggleState, changeHandler, ...other } = props;

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
            setToggleState(e.target.checked);
            changeHandler && changeHandler(index, e.target.checked);
          }}
        />
        <div
          className={clsx(
            'w-11 h-6 rounded-full peer dark:bg-abyss-700',
            'bg-gray-200 ',
            'peer-checked:after:translate-x-5 peer-checked:after:border-abyss-700 peer-checked:after:bg-abyss-700 peer-checked:bg-sky-600 peer-checked:border-none',
            " after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-white dark:border dark:box-border"
          )}
        ></div>
      </label>
    </ListItem>
  );
};

export default ListItemToggle;
