/**
 * suspense fallback component
 */
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import clsx from 'clsx';
import DataStorage from './groups/DataStorage';
import RuleManage from './groups/RuleManage';
import DictManage from './groups/DictManage';
import Skeleton from '@/components/loading/Skeleton';
import PageMotion from '@/components/transition/PageMotion';

const Setting: FC = () => {
  return (
    <PageMotion>
      <div className="mdc-header">
        <h1 className="mdc-title pb-1.5">设置</h1>
        <p className="mdc-text-sm">配置匹配规则，编辑自学习词典，查看应用数据。</p>
      </div>
      <ul className="mdc-list">
        <RuleManage />
        <DictManage />
        <DataStorage />
      </ul>
    </PageMotion>
  );
};

export default Setting;
