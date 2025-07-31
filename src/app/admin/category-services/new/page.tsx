"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ServiceForm, ServiceFormData } from "../ServiceForm";
import { useCategories } from "@/hooks/admin/useCategory";
import { useServices } from "@/hooks/admin/useServices";
import { CreateServiceInput } from "@/store/types/dataTypes";
import { Types } from "mongoose";

const CreateServicePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const { addService, loading } = useServices();
  const { categories, getCategories } = useCategories();

  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});

  // Load categories on mount
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // Form validation
  const validateForm = (formData: ServiceFormData): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (formData: ServiceFormData) => {
    // Validate the form
    if (!validateForm(formData)) {
      return;
    }

    try {
      // Prepare data for submission

      const submitData: CreateServiceInput = {
        title: formData.title,
        description: formData.description,
        categoryId: new Types.ObjectId(formData.categoryId),
        serviceImage: formData.serviceImage,
        popular: formData.popular,
        isActive: formData.isActive,
        tags: formData.tags,
      };

      const result = await addService(submitData);

      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Service created successfully!");

        // Navigate back to appropriate page
        if (categoryId) {
          router.push(`/admin/categories/${categoryId}`);
        } else {
          router.push("/admin/category-services/new");
        }
      } else {
        throw new Error("Failed to create service");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Failed to create service. Please try again.");
    }
  };

  const handleCancel = () => {
    if (categoryId) {
      router.push(`/admin/categories/${categoryId}`);
    } else {
      router.push("/admin/category-services/new");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <a
              href="/admin/services"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Services
            </a>
            <span>/</span>
            {categoryId && (
              <>
                <a
                  href={`/admin/categories/${categoryId}/services`}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Category Services
                </a>
                <span>/</span>
              </>
            )}
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Create New Service
            </span>
          </nav>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Create New Service
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a new service to{" "}
                  {categoryId
                    ? "the selected category"
                    : "your service catalog"}
                </p>
              </div>
            </div>

            {categoryId && (
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  Category: {categoryId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <ServiceForm
            mode="create"
            categoryId={categoryId || undefined}
            // Pass the categories with proper string conversion
            categories={categories.map((cat) => ({
              _id: typeof cat._id === "string" ? cat._id : cat._id.toString(),
              categoryName: cat.categoryName,
            }))}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={loading}
            errors={errors}
          />
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Creating Service
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServicePage;
