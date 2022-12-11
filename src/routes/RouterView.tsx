/**
 * @description: Router and Alert Container View
 */
import { BrowserRouter, useRoutes } from 'react-router-dom';
import routerConfig from './router.config';
import log from '@/middleware/logger';
import Navibar from './Navibar';
import { ThemeProvider } from '@/components/theme';
import { RecoilRoot } from 'recoil';
import { Suspense } from 'react';
import Skeleton from '@/components/Skeleton';

function RouterView() {
  const AppRoutes = () => useRoutes(routerConfig);
  return (
    <RecoilRoot>
      <Suspense fallback={<></>}>
        <ThemeProvider>
          <BrowserRouter>
            <Navibar delay={1500}>
              <AppRoutes />
            </Navibar>
          </BrowserRouter>
        </ThemeProvider>
      </Suspense>
    </RecoilRoot>
  );
}

export default RouterView;
