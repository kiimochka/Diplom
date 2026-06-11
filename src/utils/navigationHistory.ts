// src/utils/navigationHistory.ts
const PREVIOUS_PATH_KEY = "app_previous_path";
const CURRENT_PATH_KEY = "app_current_path";

const AUTH_PATHS = new Set(["/login", "/register"]);

export const isAuthPath = (path: string) => {
  const pathname = path.split("?")[0].split("#")[0];
  return AUTH_PATHS.has(pathname);
};

export const saveNavigationPath = (pathname: string) => {
  const currentPath = sessionStorage.getItem(CURRENT_PATH_KEY);

  if (currentPath && !isAuthPath(currentPath) && currentPath !== pathname) {
    sessionStorage.setItem(PREVIOUS_PATH_KEY, currentPath);
  }

  sessionStorage.setItem(CURRENT_PATH_KEY, pathname);
};

export const getPreviousPath = (): string | null => {
  const path = sessionStorage.getItem(PREVIOUS_PATH_KEY);
  if (!path || isAuthPath(path)) return null;
  return path;
};

export const clearPreviousPath = () => {
  sessionStorage.removeItem(PREVIOUS_PATH_KEY);
};

export const setPreviousPath = (pathname: string) => {
  if (!isAuthPath(pathname)) {
    sessionStorage.setItem(PREVIOUS_PATH_KEY, pathname);
  }
};
