import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import { ListChildComponentProps } from 'react-window';
import { SubCategoryItem } from '@/api/core';

const NormalWindow: FC<ListChildComponentProps<SubCategoryItem[]>> = ({ index, style, data }) => {
  return <></>;
};

export default NormalWindow;
