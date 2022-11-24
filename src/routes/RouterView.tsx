/**
 * @description: Router and Alert Container View
 */
import { BrowserRouter, useRoutes } from 'react-router-dom';
import routerConfig from './router.config';
import log from '@/middleware/logger';
import Navibar from './Navibar';
import { RecoilRoot } from 'recoil';

function RouterView() {
  const AppRoutes = () => useRoutes(routerConfig);
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Navibar>
          <AppRoutes />
        </Navibar>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default RouterView;
