export const BASE_BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const apiUrlConstants = {
  activities: "/api/v1/activities",
  subActivities: "/api/v1/sub-activities",
  transactionTypes: "/api/v1/transaction-types",
  locations: "/api/v1/locations",
  priceLists: "/api/v1/price-lists",
};
