export const safeRefetch = (refetch: () => unknown) => {
  try {
    return refetch();
  } catch {
    return undefined;
  }
};
