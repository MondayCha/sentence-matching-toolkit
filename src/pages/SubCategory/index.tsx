import type { FC } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';

const SubCategory: FC = () => {
  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">班级匹配</h1>
        <p className="mdc-text-sm">
          进一步匹配，基于 Jieba 分词和字符相似度算法，拟合给定班级并打分。
        </p>
      </div>
    </div>
  );
};

export default SubCategory;
