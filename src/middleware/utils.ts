export const getBaseFilenameFromPath = (path?: string) => {
  return path && decodeURIComponent(new URL(path).pathname.split('/').pop() ?? '');
};
