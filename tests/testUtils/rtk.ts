export const resolved = <T>(value: T) => ({
  unwrap: () => Promise.resolve(value),
});

export const rejected = (error: unknown) => ({
  unwrap: () => Promise.reject(error),
});
