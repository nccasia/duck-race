const getDataFromHash = (): string | null => {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    return null;
  }

  const hashQuery = hash.includes("?") ? hash.split("?").slice(1).join("?") : hash;
  return new URLSearchParams(hashQuery).get("data");
};

export const getMezonInitData = (): string | null => {
  const fromQuery = new URLSearchParams(window.location.search).get("data");
  if (fromQuery) {
    return fromQuery;
  }
  return getDataFromHash();
};
