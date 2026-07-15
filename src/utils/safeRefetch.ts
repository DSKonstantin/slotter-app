// RTK Query's refetch() throws synchronously if the query hook's subscription
// hasn't started yet (e.g. useFocusEffect firing on the very first focus,
// right after mount, before the query's own effect has run).
export const safeRefetch = (refetch: () => unknown) => {
  try {
    refetch();
  } catch {
    // ignore — see comment above
  }
};
