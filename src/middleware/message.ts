import { message } from '@tauri-apps/api/dialog';
import type { MessageDialogOptions } from '@tauri-apps/api/dialog';

export const showMessage = async (str: string, type: MessageDialogOptions['type']) => {
  let title = undefined;
  switch (type) {
    case 'info':
      title = '提示';
      break;
    case 'warning':
      title = '警告';
      break;
    case 'error':
      title = '错误';
      break;
  }
  await message(str, { title, type });
};
