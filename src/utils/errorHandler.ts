import { ERROR_MESSAGES } from "@/constants/appConstants";
import { AxiosError } from "axios";

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  type: "network" | "validation" | "server" | "unknown";
}

export class ErrorHandler {
  static handle(error: unknown): AppError {
    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }

    if (this.isValidationError(error)) {
      return this.handleValidationError(error);
    }

    return this.handleUnknownError(error);
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError)?.isAxiosError === true;
  }

  private static isValidationError(
    error: unknown
  ): error is { message: string; type: string } {
    return typeof error === "object" && error !== null && "type" in error;
  }

  private static handleAxiosError(error: AxiosError): AppError {
    const status = error.response?.status;
    const data = error.response?.data as any;

    switch (status) {
      case 400:
        return {
          message: data?.message || "Invalid request",
          code: "BAD_REQUEST",
          status,
          type: "validation",
        };
      case 401:
        return {
          message: "Authentication required",
          code: "UNAUTHORIZED",
          status,
          type: "server",
        };
      case 403:
        return {
          message: "Access denied",
          code: "FORBIDDEN",
          status,
          type: "server",
        };
      case 404:
        return {
          message: "Resource not found",
          code: "NOT_FOUND",
          status,
          type: "server",
        };
      case 500:
        return {
          message: "Server error. Please try again later",
          code: "INTERNAL_SERVER_ERROR",
          status,
          type: "server",
        };
      default:
        return {
          message: data?.message || ERROR_MESSAGES.NETWORK_ERROR,
          code: "NETWORK_ERROR",
          status,
          type: "network",
        };
    }
  }

  private static handleValidationError(error: {
    message: string;
    type: string;
  }): AppError {
    return {
      message: error.message,
      code: "VALIDATION_ERROR",
      type: "validation",
    };
  }

  private static handleUnknownError(error: unknown): AppError {
    return {
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      code: "UNKNOWN_ERROR",
      type: "unknown",
    };
  }

  static getErrorMessage(error: AppError): string {
    return error.message;
  }

  static shouldRetry(error: AppError): boolean {
    return (
      error.type === "network" && error.status !== 401 && error.status !== 403
    );
  }
}

// Convenience function for common error handling
export const handleError = (error: unknown): AppError => {
  return ErrorHandler.handle(error);
};
