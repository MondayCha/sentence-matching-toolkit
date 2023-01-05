// import { Suspense, lazy } from "react";
import { Navigate, RouteObject } from 'react-router-dom';
// import type { FC } from "react";

/**
 * Suspense fallback components
 */
import { Suspense, lazy } from 'react';

/**
 * Lazy loading components.
 * @example const Component = React.lazy(() => import('./Component'));
 */
const UploadLazy = lazy(() => import('../pages/Upload'));
const CategoryLazy = lazy(() => import('../pages/Category'));
const SubCategoryLazy = lazy(() => import('../pages/SubCategory'));
const DownloadLazy = lazy(() => import('../pages/Download'));
const AboutLazy = lazy(() => import('../pages/About'));
const SettingLazy = lazy(() => import('../pages/Setting'));

const Loading = () => <div></div>;

/**
 * Router config
 * @see {@link https://reactrouter.com/docs/en/v6/hooks/use-routes}
 */
export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: (
      <>
        <Suspense fallback={<Loading />}>
          <UploadLazy />
        </Suspense>
      </>
    ),
  },
  {
    path: '/category',
    element: (
      <>
        <Suspense fallback={<Loading />}>
          <CategoryLazy />
        </Suspense>
      </>
    ),
  },
  {
    path: '/subcategory',
    element: (
      <>
        <Suspense fallback={<Loading />}>
          <SubCategoryLazy />
        </Suspense>
      </>
    ),
  },
  {
    path: '/download',
    element: (
      <>
        <Suspense fallback={<Loading />}>
          <DownloadLazy />
        </Suspense>
      </>
    ),
  },
  {
    path: '/about',
    element: (
      <>
        <Suspense fallback={<Loading />}>
          <AboutLazy />
        </Suspense>
      </>
    ),
  },
  {
    path: '/setting',
    element: (
      <>
        <Suspense fallback={<Loading />}>
          <SettingLazy />
        </Suspense>
      </>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export default routerConfig;
