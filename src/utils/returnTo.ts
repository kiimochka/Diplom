export const getCurrentReturnPath = (location: {
  pathname: string;
  search: string;
  hash: string;
}) => `${location.pathname}${location.search}${location.hash}`;

export const buildPathWithReturnTo = (path: string, returnTo: string) => {
  const [pathnameWithSearch, hash = ""] = path.split("#");
  const [pathname, search = ""] = pathnameWithSearch.split("?");
  const params = new URLSearchParams(search);

  params.set("returnTo", returnTo);

  const nextSearch = params.toString();
  return `${pathname}${nextSearch ? `?${nextSearch}` : ""}${hash ? `#${hash}` : ""}`;
};

export const getSafeReturnTo = (value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
};
