import { SORT_DIRECTIONS } from "@/constants/appConstants";

export type SortDirection =
  (typeof SORT_DIRECTIONS)[keyof typeof SORT_DIRECTIONS];

export interface SortConfig<T> {
  field: keyof T;
  direction: SortDirection;
}

export class SortUtils {
  static sort<T extends Record<string, any>>(
    items: T[],
    config: SortConfig<T>
  ): T[] {
    const { field, direction } = config;

    return [...items].sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      // Handle boolean values
      if (typeof valueA === "boolean" && typeof valueB === "boolean") {
        return direction === SORT_DIRECTIONS.ASC
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      }

      // Handle string values
      if (typeof valueA === "string" && typeof valueB === "string") {
        return direction === SORT_DIRECTIONS.ASC
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Handle number values
      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === SORT_DIRECTIONS.ASC
          ? valueA - valueB
          : valueB - valueA;
      }

      // Handle date values
      if (
        valueA &&
        valueB &&
        typeof valueA === "object" &&
        typeof valueB === "object" &&
        "getTime" in valueA &&
        "getTime" in valueB
      ) {
        return direction === SORT_DIRECTIONS.ASC
          ? (valueA as Date).getTime() - (valueB as Date).getTime()
          : (valueB as Date).getTime() - (valueA as Date).getTime();
      }

      // Handle string dates
      if (typeof valueA === "string" && typeof valueB === "string") {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return direction === SORT_DIRECTIONS.ASC
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }
      }

      return 0;
    });
  }

  static toggleSortDirection(currentDirection: SortDirection): SortDirection {
    return currentDirection === SORT_DIRECTIONS.ASC
      ? SORT_DIRECTIONS.DESC
      : SORT_DIRECTIONS.ASC;
  }

  static getNextSortConfig<T>(
    currentField: keyof T,
    currentDirection: SortDirection,
    newField: keyof T
  ): SortConfig<T> {
    if (currentField === newField) {
      return {
        field: newField,
        direction: this.toggleSortDirection(currentDirection),
      };
    }

    return {
      field: newField,
      direction: SORT_DIRECTIONS.ASC,
    };
  }
}
