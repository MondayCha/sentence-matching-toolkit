import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';

const CategoryContent: FC = () => {
  return (
    <p className="mdc-text-sm">
      根据规则，已发现<span className=" mdc-text-heightlight">50</span>条数据和
      <span className=" mdc-text-heightlight">80</span>条疑似数据。
    </p>
  );
};

export default CategoryContent;
