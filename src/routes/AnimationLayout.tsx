import { FC, Suspense } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import { useLocation, useRoutes } from 'react-router-dom';
import routerConfig from './router.config';
import { cloneElement } from 'react';
import { AnimatePresence } from 'framer-motion';

const AnimationLayout = () => {
  const element = useRoutes(routerConfig);
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {!!element && cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
};

export default AnimationLayout;
