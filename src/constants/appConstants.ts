// Application Constants
export const SORT_DIRECTIONS = {
  ASC: "asc" as const,
  DESC: "desc" as const,
} as const;

export const LOADING_STATES = {
  IDLE: "idle" as const,
  PENDING: "pending" as const,
  FULFILLED: "fulfilled" as const,
  REJECTED: "rejected" as const,
} as const;

export const ORDER_STATUSES = {
  PENDING: "pending" as const,
  IN_PROGRESS: "in-progress" as const,
  COMPLETED: "completed" as const,
  CANCELLED: "cancelled" as const,
} as const;

export const FINANCE_EFFECTS = {
  NONE: "none" as const,
  POSITIVE: "positive" as const,
  NEGATIVE: "negative" as const,
} as const;

export const PRICING_METHODS = {
  PER_LOCATION: "perLocation" as const,
  PER_ITEM: "perItem" as const,
  PER_TRIP: "perTrip" as const,
} as const;

// Table column configurations
export const ACTIVITY_TABLE_COLUMNS = {
  ACT_SRL: "actSrl",
  ACTIVITY_CODE: "activityCode",
  ACTIVITY_NAME_EN: "activityNameEn",
  ACTIVITY_NAME_AR: "activityNameAr",
  ACTIVITY_TRANSACTION_TYPE: "activityTransactionType",
  IS_WITH_ITEMS: "isWithItems",
  IS_OPS_ACTIVE: "isOpsActive",
  IS_PORTAL_ACTIVE: "isPortalActive",
  IS_IN_ORDER_SCREEN: "isInOrderScreen",
  IS_IN_SHIPPING_UNIT: "isInShippingUnit",
  IS_IN_SPECIAL_REQUIREMENT: "isInSpecialRequirement",
  IS_ACTIVE: "isActive",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNEXPECTED_ERROR: "An unexpected error occurred",
  NETWORK_ERROR: "Network error. Please check your connection",
  VALIDATION_ERROR: "Please check your input and try again",
  DELETE_CONFIRMATION: "This action cannot be undone",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ACTIVITY_ADDED: "Activity added successfully",
  ACTIVITY_UPDATED: "Activity updated successfully",
  ACTIVITY_DELETED: "Activity deleted successfully",
  SUB_ACTIVITY_ADDED: "Sub-activity added successfully",
  SUB_ACTIVITY_UPDATED: "Sub-activity updated successfully",
  SUB_ACTIVITY_DELETED: "Sub-activity deleted successfully",
} as const;
