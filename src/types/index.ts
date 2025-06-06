export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export type TLoading = "idle" | "pending" | "fulfilled" | "rejected";
