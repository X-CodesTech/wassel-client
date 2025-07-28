import { isAxiosError } from "axios";

export const axiosErrorHandler = (error: unknown): string => {
  if (isAxiosError(error)) {
    // Handle network errors (no response)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "Request timeout. Please try again.";
      }
      if (error.code === "ERR_NETWORK") {
        return "Network error. Please check your connection.";
      }
      return error.message || "Network error occurred.";
    }

    // Handle response errors
    const { status, data } = error.response;

    // Try to extract error message from response data
    let errorMessage = "";

    if (data) {
      // Handle different response data structures
      if (typeof data === "string") {
        errorMessage = data;
      } else if (typeof data === "object" && data !== null) {
        // Check for common error message properties
        if ("message" in data && typeof data.message === "string") {
          errorMessage = data.message;
        } else if ("error" in data && typeof data.error === "string") {
          errorMessage = data.error;
        } else if ("detail" in data && typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (
          "errorMessage" in data &&
          typeof data.errorMessage === "string"
        ) {
          errorMessage = data.errorMessage;
        }
      }
    }

    // If we have a specific error message from the server, return it
    if (errorMessage) {
      return errorMessage;
    }

    // Only use status messages as fallbacks when no specific error message is available
    if (status) {
      const statusMessages: Record<number, string> = {
        400: "Bad request",
        401: "Unauthorized. Please log in again.",
        403: "Access denied",
        404: "Resource not found",
        409: "Conflict with existing data",
        422: "Validation error",
        429: "Too many requests. Please try again later.",
        500: "Server error. Please try again later.",
        502: "Bad gateway",
        503: "Service unavailable",
        504: "Gateway timeout",
      };

      return statusMessages[status] || "An error occurred";
    }

    return "An error occurred";
  } else {
    // Handle non-Axios errors
    if (error instanceof Error) {
      return error.message || "An unexpected error occurred";
    }
    if (typeof error === "string") {
      return error;
    }
    return "An unexpected error occurred";
  }
};
