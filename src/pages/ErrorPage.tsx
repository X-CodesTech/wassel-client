import { useLocation } from "wouter";
import { ErrorComponent, NotFoundError } from "@/components/ErrorComponents";

interface ErrorPageProps {
  params?: {
    code?: string;
  };
}

export default function ErrorPage({ params }: ErrorPageProps) {
  const [location] = useLocation();

  // Parse error information from URL or default to 404
  const errorCode = params?.code || "404";

  // Map common HTTP status codes to error types
  const getErrorConfig = (code: string) => {
    switch (code) {
      case "400":
        return {
          type: "validation" as const,
          code: "400",
          title: "Bad Request",
          message: "The request could not be understood by the server.",
        };
      case "401":
        return {
          type: "permission" as const,
          code: "401",
          title: "Unauthorized",
          message: "You need to log in to access this resource.",
        };
      case "403":
        return {
          type: "permission" as const,
          code: "403",
          title: "Forbidden",
          message: "You don't have permission to access this resource.",
        };
      case "404":
        return {
          type: "notFound" as const,
          code: "404",
          title: "Page Not Found",
          message: "The page you're looking for doesn't exist.",
        };
      case "500":
        return {
          type: "server" as const,
          code: "500",
          title: "Internal Server Error",
          message: "Something went wrong on our servers.",
        };
      case "502":
        return {
          type: "server" as const,
          code: "502",
          title: "Bad Gateway",
          message:
            "The server received an invalid response from the upstream server.",
        };
      case "503":
        return {
          type: "server" as const,
          code: "503",
          title: "Service Unavailable",
          message:
            "The service is temporarily unavailable. Please try again later.",
        };
      default:
        return {
          type: "unknown" as const,
          code: errorCode,
          title: "Error",
          message: "An unexpected error occurred.",
        };
    }
  };

  const errorConfig = getErrorConfig(errorCode);

  return (
    <ErrorComponent
      error={{
        ...errorConfig,
        timestamp: new Date().toISOString(),
        details: `Current path: ${location}`,
      }}
    />
  );
}

// Default 404 component for unmatched routes
export function NotFound() {
  return (
    <NotFoundError
      error={{
        details:
          "The page you're looking for might have been moved, deleted, or doesn't exist.",
        timestamp: new Date().toISOString(),
      }}
    />
  );
}
