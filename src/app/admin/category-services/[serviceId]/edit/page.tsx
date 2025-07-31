"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { ServiceForm, ServiceFormData } from "../../ServiceForm";
import Link from "next/link";
import { useCategories } from "@/hooks/admin/useCategory";
import { useServices } from "@/hooks/admin/useServices";
import { Service, UpdateServiceInput } from "@/store/types/dataTypes";
import { Types } from "mongoose";

const EditServicePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const serviceId = params.serviceId as string;
  const categoryId = searchParams.get("categoryId");

  const {
    selectedService,
    editService,
    getServiceById,
    loading,
    error,
    clearServiceError,
  } = useServices();

  const { categories, getCategories } = useCategories();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<ServiceFormData>>({});

  // Helper function to convert string to ObjectId
  const toObjectId = (id: string): Types.ObjectId => {
    return new Types.ObjectId(id);
  };

  // Helper function to safely convert ObjectId to string
  const toStringId = (id: Types.ObjectId | string): string => {
    return typeof id === "string" ? id : id.toString();
  };

  // Fetch categories and service data on mount
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        toast.error("Service ID is required");
        router.push("/admin");
        return;
      }

      try {
        setIsInitialLoading(true);
        clearServiceError();

        const result = await getServiceById(serviceId, true);

        if (result.meta.requestStatus === "fulfilled") {
          const payload = result.payload as Service | undefined;
          setServiceData(
            payload
              ? {
                  ...payload,
                  categoryId: payload.categoryId,
                }
              : null
          );
        } else {
          throw new Error("Failed to fetch service");
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        toast.error("Failed to load service data");
        router.push("/admin");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchService();
  }, [serviceId, getServiceById, clearServiceError, router]);

  // Update local state when selected service changes
  useEffect(() => {
    if (selectedService) {
      setServiceData({
        ...selectedService,
        categoryId: selectedService.categoryId,
      });
    }
  }, [selectedService]);

  const validateForm = (data: ServiceFormData): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!data.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!data.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!data.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateService = async (formData: ServiceFormData) => {
    if (!validateForm(formData)) {
      return;
    }

    if (!serviceData) {
      toast.error("Service data not found");
      return;
    }

    try {
      // Convert form data to match UpdateServiceInput interface
      const updateData: UpdateServiceInput = {
        _id: serviceData._id,
        title: formData.title,
        description: formData.description,
        categoryId: toObjectId(formData.categoryId), // Convert string to ObjectId
        serviceImage: formData.serviceImage,
        popular: formData.popular,
        isActive: formData.isActive,
        tags: formData.tags,
      };

      const result = await editService(serviceId, updateData);

      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Service updated successfully!");
        setFormErrors({});

        if (categoryId) {
          router.push(`/admin/categories/${categoryId}/services`);
        } else {
          router.push("/admin");
        }
      } else {
        throw new Error("Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);

      // Check if it's a validation error
      if (error instanceof Error && error.message.includes("ObjectId")) {
        toast.error(
          "Invalid category ID format. Please select a valid category."
        );
      } else {
        toast.error("Failed to update service. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    if (categoryId) {
      router.push(`/categories/${categoryId}/services`);
    } else if (serviceData) {
      router.push(`/services/${toStringId(serviceData._id)}`);
    } else {
      router.push("/services");
    }
  };

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Loading Service
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Service Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The service could not be found or loaded.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/services")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Services
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link
              href="/services"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Services
            </Link>
            <span>/</span>
            {categoryId && (
              <>
                <a
                  href={`/categories/${categoryId}/services`}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Category Services
                </a>
                <span>/</span>
              </>
            )}
            {serviceData && (
              <>
                <a
                  href={`/services/${toStringId(serviceData._id)}`}
                  className="hover:text-gray-700 dark:hover:text-gray-300 truncate max-w-xs"
                >
                  {serviceData.title}
                </a>
                <span>/</span>
              </>
            )}
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              Edit
            </span>
          </nav>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Edit Service
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update the service information
                </p>
              </div>
            </div>

            {serviceData && (
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                  {serviceData.title}
                </span>
                {categoryId && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    Category: {categoryId}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {serviceData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <ServiceForm
              mode="edit"
              initialData={serviceData}
              categoryId={categoryId || toStringId(serviceData.categoryId)}
              categories={categories.map((cat) => ({
                ...cat,
                _id: toStringId(cat._id),
              }))}
              onSubmit={handleUpdateService}
              onCancel={handleCancel}
              isLoading={loading}
              errors={formErrors}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {loading && !isInitialLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-600 border-t-transparent"></div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Updating Service
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

export default EditServicePage;
