"use client";

import React, { useEffect, useState } from "react";
import CategoryFormsUi from "../../CategoryFormsUi";
import { useRouter, useParams } from "next/navigation";
import { useCategories } from "@/hooks/admin/useCategory";
import { Category } from "@/store/types/dataTypes";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const {
    selectedCategory,
    getCategoryById,
    loading,
    error,
    clearCategoryError,
  } = useCategories();

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Fetch category data when component mounts or ID changes
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id || typeof id !== "string") {
        return;
      }

      setPageLoading(true);
      setPageError(null);
      clearCategoryError();

      try {
        const result = await getCategoryById(id);
        if (result.type.endsWith("/rejected")) {
          setPageError("Category not found or could not be loaded");
        }
      } catch {
        setPageError("Failed to load category data");
      } finally {
        setPageLoading(false);
      }
    };

    fetchCategory();
  }, [id, getCategoryById, clearCategoryError]);

  const handleSuccess = (category: Category) => {
    // Show success message (you can use a toast library here)
    console.log("Category updated successfully:", category);

    // Redirect to categories list or stay on the same page
    // router.push("/categories");
    // Or redirect to the category's detail page:
    router.push(`/admin/categories/${category._id}`);
  };

  const handleCancel = () => {
    // Navigate back to categories list or category detail
    // router.push("/categories");
    // Or go back to the previous page:
    router.back();
  };

  // Loading state
  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-3">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                Loading category...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (pageError || error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-6 max-w-md w-full">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400 dark:text-red-300"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error Loading Category
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {pageError || error}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Category not found
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Category Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The category you&#39;re looking for doesn&#39;t exist or has
                been removed.
              </p>
            </div>
            <button
              onClick={() => router.push("/admin")}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <button
                onClick={() => router.push("/admin")}
                className="hover:text-gray-700 dark:hover:text-gray-200 underline transition-colors"
              >
                Categories
              </button>
            </li>
            <li>/</li>
            <li>
              <button
                onClick={() =>
                  router.push(`/admin/categories/${selectedCategory._id}`)
                }
                className="hover:text-gray-700 dark:hover:text-gray-200 underline transition-colors"
              >
                {selectedCategory.categoryName}
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">Edit</li>
          </ol>
        </nav>

        {/* Form Component */}
        <CategoryFormsUi
          category={selectedCategory}
          isEditMode={true}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
