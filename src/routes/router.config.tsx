// import { Suspense, lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
// import type { FC } from "react";

/**
 * Suspense fallback components
 */
// import Loading from "../pages/Loading";
import Upload from "../pages/Upload";
import Category from "../pages/Category";
import SubCategory from "../pages/SubCategory";
import Download from "../pages/Download";
import About from "../pages/About";
import Setting from "../pages/Setting";

/**
 * Lazy loading components.
 * @example const Component = React.lazy(() => import('./Component'));
 */
// const UploadLazy = lazy(() => import("../pages/Upload"));
// const AppLazy = lazy(() => import("../App"));

// /**
//  * Router elements
//  */
// const Upload: FC = () => {
//   return (
//     <Suspense fallback={<Loading />}>
//       <UploadLazy />
//     </Suspense>
//   );
// };

// const App: FC = () => {
//   return (
//     <Suspense fallback={<Loading />}>
//       <AppLazy />
//     </Suspense>
//   );
// };

/**
 * Router config
 * @see {@link https://reactrouter.com/docs/en/v6/hooks/use-routes}
 */
export const routerConfig: RouteObject[] = [
  {
    path: "/",
    element: <Upload />,
  },
  {
    path: "/category",
    element: <Category />,
  },
  {
    path: "/subcategory",
    element: <SubCategory />,
  },
  {
    path: "/download",
    element: <Download />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/setting",
    element: <Setting />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routerConfig;
