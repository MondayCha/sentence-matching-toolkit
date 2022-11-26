import moment from 'moment';

export const getBaseFilenameFromPath = (path?: string) => {
  return path && decodeURIComponent(new URL(path).pathname.split('/').pop() ?? '');
};

// moment().format('YYYY-MM-DD HH:mm:ss')
export const getTimestamp = () => moment().format('YYYY.MM.DD_HH.mm.ss');
