/**
 * @description: Router and Alert Container View
 */
import { BrowserRouter } from 'react-router-dom';
import routerConfig from './router.config';
import log from '@/middleware/logger';
import Navibar from './Navibar';
import { ThemeProvider } from '@/components/theme';
import { RecoilRoot } from 'recoil';
import AnimationLayout from './AnimationLayout';
import { Suspense } from 'react';
import Skeleton from '@/components/loading/Skeleton';

function RouterView() {
  return (
    <RecoilRoot>
      <Suspense fallback={<></>}>
        <ThemeProvider>
          <BrowserRouter>
            <Navibar delay={1500}>
              <Suspense fallback={<Skeleton />}>
                <AnimationLayout />
              </Suspense>
            </Navibar>
          </BrowserRouter>
        </ThemeProvider>
      </Suspense>
    </RecoilRoot>
  );
}

export default RouterView;
