import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import Spin from '@/assets/others/Spin';

const SearchInput: FC<{
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  debouncedSearchKeyword: string;
  isLoading: boolean;
  clickHandler: () => void;
}> = ({ searchKeyword, setSearchKeyword, debouncedSearchKeyword, isLoading, clickHandler }) => {
  return (
    <div className="pl-4 lg:pl-6 flex flex-row justify-between items-center h-8 lg:h-9 w-full lg:pt-1">
      <form className="flex items-center h-8">
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-zinc-500 dark:text-zinc-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            id="simple-search"
            value={searchKeyword}
            className="bg-haruki-50 border leading-none text-sm rounded focus:border-primary-light-400 block w-full pl-10 pr-8 h-8 placeholder-zinc-400 dark:border-abyss-600 dark:bg-abyss-700 dark:border-opacity-50 dark:placeholder-zinc-500 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
            placeholder="输入关键字"
            autoComplete="off"
            onChange={(e) => {
              setSearchKeyword(e.target.value);
            }}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button
              type="button"
              className={clsx(
                'inline-flex items-center p-0.5 ml-2 text-sm text-zinc-400 dark:text-zinc-500 bg-transparent rounded-full hover:bg-haruki-300 dark:hover:bg-abyss-600',
                {
                  hidden: debouncedSearchKeyword.length === 0,
                }
              )}
              onClick={() => {
                setSearchKeyword('');
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Remove badge</span>
            </button>
          </div>
        </div>
      </form>
      <button className="mdc-btn-primary mr-12 lg:mr-14" onClick={clickHandler}>
        {isLoading ? <Spin /> : '提交'}
      </button>
    </div>
  );
};

export default SearchInput;
