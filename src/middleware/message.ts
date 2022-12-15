import { message, confirm } from '@tauri-apps/api/dialog';
import type { MessageDialogOptions } from '@tauri-apps/api/dialog';

export const showMessage = async (str: unknown, type: MessageDialogOptions['type']) => {
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
  if (typeof str !== 'string') {
    str = JSON.stringify(str);
  }
  await message(str as string, { title, type });
};

export const showConfirm = async (str: string, type: MessageDialogOptions['type']) => {
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
  return await confirm(str, { title, type });
};
