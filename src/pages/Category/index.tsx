/**
 * suspense fallback component
 */
import clsx from 'clsx';
import type { FC } from 'react';
import { useState } from 'react';

const Category: FC = () => {
  const [count, setCount] = useState(0);
  const [countSeem, setCountSeem] = useState(0);
  return (
    <div className={clsx('mdc-paper')}>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">单位匹配</h1>
        <p className="mdc-text-sm">
          根据规则，已发现 {count} 条数据，同时存在 {countSeem} 条疑似数据。
        </p>
      </div>
    </div>
  );
};

export default Category;
