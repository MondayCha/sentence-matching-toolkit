/**
 * @description: Router and Alert Container View
 */
import { BrowserRouter, useRoutes } from 'react-router-dom';
import routerConfig from './router.config';
import log from '@/middleware/logger';
import Navibar from './Navibar';
import { Store } from 'tauri-plugin-store-api';

function RouterView() {
  const AppRoutes = () => useRoutes(routerConfig);
  return (
    <BrowserRouter>
      <Navibar>
        <AppRoutes />
      </Navibar>
    </BrowserRouter>
  );
}

export const store = new Store('.settings.dat');

export default RouterView;
