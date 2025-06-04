import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Wifi,
  Server,
  Shield,
  FileX,
  Bug,
  HelpCircle,
} from "lucide-react";
import { useLocation } from "wouter";

export interface ErrorInfo {
  type:
    | "network"
    | "server"
    | "permission"
    | "notFound"
    | "validation"
    | "unknown";
  title?: string;
  message?: string;
  details?: string;
  code?: string | number;
  timestamp?: string;
  canRetry?: boolean;
  canGoBack?: boolean;
  canGoHome?: boolean;
}

interface ErrorComponentProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
}

const errorConfigs = {
  network: {
    icon: Wifi,
    title: "Connection Problem",
    defaultMessage:
      "Unable to connect to the server. Please check your internet connection.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  server: {
    icon: Server,
    title: "Server Error",
    defaultMessage:
      "Something went wrong on our end. Our team has been notified.",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  permission: {
    icon: Shield,
    title: "Access Denied",
    defaultMessage: "You don't have permission to access this resource.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  notFound: {
    icon: FileX,
    title: "Page Not Found",
    defaultMessage:
      "The page you're looking for doesn't exist or has been moved.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  validation: {
    icon: AlertTriangle,
    title: "Invalid Request",
    defaultMessage: "The request contains invalid or missing information.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  unknown: {
    icon: Bug,
    title: "Unexpected Error",
    defaultMessage: "An unexpected error occurred. Please try again.",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

export function ErrorComponent({
  error,
  onRetry,
  onGoBack,
  onGoHome,
  className = "",
}: ErrorComponentProps) {
  const [location, navigate] = useLocation();
  const config = errorConfigs[error.type];
  const IconComponent = config.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-[60vh] p-8 ${className}`}
    >
      <Card className={`max-w-2xl w-full ${config.borderColor} border-2`}>
        <CardHeader className={`${config.bgColor} text-center`}>
          <div className="flex justify-center mb-4">
            <div
              className={`p-4 rounded-full ${config.bgColor} border-2 ${config.borderColor}`}
            >
              <IconComponent className={`h-12 w-12 ${config.color}`} />
            </div>
          </div>
          <CardTitle className={`text-2xl font-bold ${config.color}`}>
            {error.title || config.title}
          </CardTitle>
          {error.code && (
            <Badge variant="outline" className={`mx-auto mt-2 ${config.color}`}>
              Error Code: {error.code}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-700 text-lg">
              {error.message || config.defaultMessage}
            </p>

            {error.details && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Additional Details
                </h4>
                <p className="text-sm text-gray-600">{error.details}</p>
              </div>
            )}

            {error.timestamp && (
              <p className="text-xs text-gray-500">
                Occurred at: {new Date(error.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {error.canRetry !== false && (
              <Button onClick={handleRetry} className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}

            {error.canGoBack !== false && (
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}

            {error.canGoHome !== false && (
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex items-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">
              What you can do:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {error.type === "network" && (
                <>
                  <li>• Check your internet connection</li>
                  <li>• Try refreshing the page</li>
                  <li>
                    • Contact your network administrator if the problem persists
                  </li>
                </>
              )}
              {error.type === "server" && (
                <>
                  <li>• Wait a few minutes and try again</li>
                  <li>
                    • The issue has been automatically reported to our team
                  </li>
                  <li>• Contact support if the problem continues</li>
                </>
              )}
              {error.type === "permission" && (
                <>
                  <li>• Contact your administrator to request access</li>
                  <li>• Make sure you're logged in with the correct account</li>
                  <li>• Try logging out and logging back in</li>
                </>
              )}
              {error.type === "notFound" && (
                <>
                  <li>• Check the URL for typos</li>
                  <li>
                    • Use the navigation menu to find what you're looking for
                  </li>
                  <li>• The page may have been moved or deleted</li>
                </>
              )}
              {error.type === "validation" && (
                <>
                  <li>• Review the information you entered</li>
                  <li>• Make sure all required fields are filled</li>
                  <li>• Check that the data format is correct</li>
                </>
              )}
              {error.type === "unknown" && (
                <>
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Contact support if the issue persists</li>
                </>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Pre-configured error components for common scenarios
export function NetworkError(
  props: Omit<ErrorComponentProps, "error"> & { error?: Partial<ErrorInfo> }
) {
  return (
    <ErrorComponent {...props} error={{ type: "network", ...props.error }} />
  );
}

export function ServerError(
  props: Omit<ErrorComponentProps, "error"> & { error?: Partial<ErrorInfo> }
) {
  return (
    <ErrorComponent {...props} error={{ type: "server", ...props.error }} />
  );
}

export function NotFoundError(
  props: Omit<ErrorComponentProps, "error"> & { error?: Partial<ErrorInfo> }
) {
  return (
    <ErrorComponent {...props} error={{ type: "notFound", ...props.error }} />
  );
}

export function PermissionError(
  props: Omit<ErrorComponentProps, "error"> & { error?: Partial<ErrorInfo> }
) {
  return (
    <ErrorComponent {...props} error={{ type: "permission", ...props.error }} />
  );
}

export function ValidationError(
  props: Omit<ErrorComponentProps, "error"> & { error?: Partial<ErrorInfo> }
) {
  return (
    <ErrorComponent {...props} error={{ type: "validation", ...props.error }} />
  );
}

export function UnknownError(
  props: Omit<ErrorComponentProps, "error"> & { error?: Partial<ErrorInfo> }
) {
  return (
    <ErrorComponent {...props} error={{ type: "unknown", ...props.error }} />
  );
}
