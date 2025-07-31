"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Home, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorInfo {
  title: string;
  message: string;
  description: string;
  statusCode?: number;
}

const ERROR_TYPES: Record<string, ErrorInfo> = {
  Configuration: {
    title: "Configuration Error",
    message: "There was a problem with the system configuration.",
    description:
      "The application configuration is invalid or missing. Please contact your administrator to resolve this issue.",
    statusCode: 500,
  },
  Authorization: {
    title: "Access Denied",
    message: "You are not authorized to access this page.",
    description:
      "You don't have the necessary permissions to view this content. Please contact your administrator if you believe this is an error.",
    statusCode: 403,
  },
  Authentication: {
    title: "Authentication Required",
    message: "Please log in to continue.",
    description:
      "You need to be authenticated to access this resource. Please sign in with your credentials.",
    statusCode: 401,
  },
  NotFound: {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
    description:
      "The requested resource could not be found on this server. Please check the URL and try again.",
    statusCode: 404,
  },
  Default: {
    title: "Something went wrong",
    message: "An unexpected error occurred.",
    description:
      "We're sorry, but something went wrong. Please try again later or contact support if the problem persists.",
    statusCode: 500,
  },
};

const ErrorPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const errorType = error || "Default";
  const errorInfo = ERROR_TYPES[errorType] || ERROR_TYPES.Default;

  const handleGoHome = (): void => {
    router.push("/");
  };

  const handleGoBack = (): void => {
    router.back();
  };

  const handleRetry = (): void => {
    // Refresh the current page
    router.refresh();
  };

  React.useEffect(() => {
    // Log error for monitoring/analytics
    const errorDetails = {
      errorType,
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "SSR",
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "SSR",
    };

    // In development, use console.log to avoid Next.js error interception
    // In production, error tracking services will handle this
    if (process.env.NODE_ENV === "development") {
      console.log(`[Error Page] ${errorType}:`, errorDetails);
    } else {
      console.error(`Error page rendered: ${errorType}`, errorDetails);
    }

    // Optional: Send to error tracking service
    // Example: Sentry.captureMessage(`Error page: ${errorType}`, 'error');
  }, [errorType]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow dark:shadow-gray-700/50 sm:rounded-lg sm:px-10 transition-all">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full transition-colors">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Error Content */}
          <div className="text-center">
            {errorInfo.statusCode && (
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 transition-colors">
                Error {errorInfo.statusCode}
              </p>
            )}

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
              {errorInfo.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 transition-colors">
              {errorInfo.message}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 transition-colors">
              {errorInfo.description}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleGoBack}
                  className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </button>

                <button
                  onClick={handleGoHome}
                  className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </button>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                If you continue to experience issues, please contact{" "}
                <a
                  href="mailto:support@yourapp.com"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  support@yourapp.com
                </a>
              </p>

              {/* Error ID for support reference */}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 transition-colors">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
