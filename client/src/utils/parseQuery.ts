export const getQuery = () => {
  const queryStr = window.location.search.slice(1);

  return Object.fromEntries(
    queryStr.split("&").map((i) => {
      const data = i.split("=");
      return [data[0], data[1]];
    })
  );
};
