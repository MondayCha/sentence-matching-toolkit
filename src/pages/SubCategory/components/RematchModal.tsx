import { FC, useMemo } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import { SubCategoryItem } from '@/api/core';
import Spin from '@/assets/others/Spin';

export interface CurrentInfo {
  name: string;
  company: string;
}

const DEFAULT_CURRENT_INFO: CurrentInfo = {
  name: '',
  company: '',
};

const RematchModal: FC<{
  currentRecord: SubCategoryItem;
  handleCancel: () => void;
  handleRematch: (currentInfo: CurrentInfo) => void;
  isRematching: boolean;
  handleSave: () => void;
}> = ({ currentRecord, handleCancel, handleRematch, isRematching, handleSave }) => {
  const [currentInfo, setCurrentInfo] = useState({
    name: currentRecord.raw.name,
    company: currentRecord.raw.company,
  });

  const shouldRematch = useMemo(() => {
    return (
      currentInfo.name !== currentRecord.raw.name ||
      currentInfo.company !== currentRecord.raw.company
    );
  }, [currentInfo, currentRecord]);

  return (
    <div
      id="defaultModal"
      tabIndex={-1}
      className={clsx(
        'absolute inset-0 z-50 w-full h-full overflow-x-hidden overflow-y-auto flex justify-center items-center'
      )}
    >
      {/* <!-- Modal content --> */}
      <div className="bg-white rounded-lg shadow-xl border dark:border-haruki-400 dark:border-opacity-10 p-4 dark:bg-abyss-850 max-h-96 w-3/5 max-w-xl flex flex-col">
        {/* <!-- Modal body --> */}
        <div className=" overflow-y-auto mdc-scroolbar grow space-y-3">
          <p className="mdc-text-xs leading-tight">用户数据-姓名：{currentRecord.raw.name}</p>
          <p className="mdc-text-xs leading-tight">用户数据-单位：{currentRecord.raw.company}</p>
          <p className="mdc-text-xs leading-tight">
            软件提取-姓名：
            <span className="mdc-text-heightlight">{currentRecord.sub.name}</span>
          </p>
          <p className="mdc-text-xs leading-tight mx-0">
            软件提取-班级：
            <span className="mdc-text-heightlight mx-0">{currentRecord.sub.company}</span>
          </p>
          <p className="mdc-text-xs leading-tight">
            软件提取-匹配：
            <span className="mdc-text-heightlight mx-0">{currentRecord.matchedClass ?? '无'}</span>
          </p>
          <input
            type="text"
            value={currentInfo.name}
            className="bg-haruki-50 border leading-none mdc-text-xs rounded focus:border-primary-light-400 block w-full px-4 h-8 placeholder-zinc-400 dark:border-abyss-600 dark:bg-abyss-700 dark:border-opacity-50 dark:placeholder-zinc-500 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
            onChange={(e) => {
              setCurrentInfo((prev) => ({
                name: e.target.value,
                company: prev.company,
              }));
            }}
          />
          <input
            type="text"
            value={currentInfo.company}
            className="bg-haruki-50 border leading-none mdc-text-xs rounded focus:border-primary-light-400 block w-full px-4 h-8 placeholder-zinc-400 dark:border-abyss-600 dark:bg-abyss-700 dark:border-opacity-50 dark:placeholder-zinc-500 dark:text-zinc-200 dark:focus:border-primary-dark-400 text-abyss-900 focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
            onChange={(e) => {
              setCurrentInfo((prev) => ({
                name: prev.name,
                company: e.target.value,
              }));
            }}
          />
        </div>
        {/* <!-- Modal footer --> */}
        <div className="flex items-center pt-3 justify-end space-x-3 border-gray-200 rounded-b dark:border-gray-600">
          <button
            data-modal-toggle="defaultModal"
            type="button"
            className="mdc-btn-secondary"
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            data-modal-toggle="defaultModal"
            type="button"
            className="mdc-btn-primary"
            onClick={shouldRematch ? () => handleRematch(currentInfo) : handleSave}
          >
            {shouldRematch ? isRematching ? <Spin /> : '匹配' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RematchModal;
