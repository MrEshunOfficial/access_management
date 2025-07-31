// src/app/admin/categories/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoryHeader from "../Uicomponents/CategoryHeader";
import ServicesControlPanel from "../Uicomponents/ServiceControlPanel";
import ServicesGrid from "../Uicomponents/ServiceGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { useCategories } from "@/hooks/admin/useCategory";
import { useServices } from "@/hooks/admin/useServices";
import { Types } from "mongoose";

// Define the stats interface
interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  popular: number;
}

const CategoryDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  // Hooks
  const {
    selectedCategory,
    loading: categoryLoading,
    error: categoryError,
    getCategoryById,
    removeCategory,
    refreshAfterServiceOperation,
  } = useCategories();

  const {
    services,
    loading: servicesLoading,
    error: servicesError,
    getServicesByCategory,
    removeService,
    toggleActive,
    togglePopular,
  } = useServices();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState<
    "all" | "active" | "inactive" | "popular"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Effects
  useEffect(() => {
    if (categoryId) {
      // Validate categoryId format if needed
      if (Types.ObjectId.isValid(categoryId)) {
        getCategoryById(categoryId, true);
        getServicesByCategory(categoryId);
      } else {
        console.error("Invalid category ID format");
      }
    }
  }, [categoryId, getCategoryById, getServicesByCategory]);

  // Statistics calculations
  const stats: CategoryStats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    inactive: services.filter((s) => !s.isActive).length,
    popular: services.filter((s) => s.popular).length,
  };

  // Filtered services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ??
        false);

    const matchesFilter =
      serviceFilter === "all" ||
      (serviceFilter === "active" && service.isActive) ||
      (serviceFilter === "inactive" && !service.isActive) ||
      (serviceFilter === "popular" && service.popular);

    return matchesSearch && matchesFilter;
  });

  // Event handlers
  const handleCategoryDelete = async () => {
    if (!selectedCategory) return;

    try {
      await removeCategory(selectedCategory._id.toString());
      router.push("/admin/categories");
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleServiceDelete = async (serviceId: string) => {
    try {
      await removeService(serviceId);
      await refreshAfterServiceOperation();
      await getServicesByCategory(categoryId);
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const handleServiceToggleActive = async (serviceId: string) => {
    try {
      await toggleActive(serviceId);
      // Refresh services list to show updated status
      await getServicesByCategory(categoryId);
    } catch (error) {
      console.error("Failed to toggle service active status:", error);
    }
  };

  const handleServiceTogglePopular = async (serviceId: string) => {
    try {
      await togglePopular(serviceId);
      // Refresh services list to show updated status
      await getServicesByCategory(categoryId);
    } catch (error) {
      console.error("Failed to toggle service popular status:", error);
    }
  };

  const handleEditService = (serviceId: string) => {
    router.push(`/admin/category-services/${serviceId}/edit`);
  };

  const handleCreateService = () => {
    router.push(`/admin/category-services/new?categoryId=${categoryId}`);
  };

  const handleBackToCategories = () => {
    router.push("/admin/categories");
  };

  // Loading state
  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300">
            Loading category details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (categoryError || servicesError || !selectedCategory) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {categoryError ? "Error Loading Category" : "Category Not Found"}
            </h1>
            <p className="text-muted-foreground mb-6 dark:text-gray-400">
              {categoryError
                ? "Failed to load category details. Please try again."
                : "The category you're looking for doesn't exist or has been removed."}
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleBackToCategories}
                className="w-full"
                variant="default"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
              {categoryError && (
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                  variant="outline"
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Category Header */}
      <CategoryHeader
        category={{
          ...selectedCategory,
          _id: selectedCategory._id.toString(),
        }}
        stats={stats}
        onDeleteCategory={handleCategoryDelete}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Services Control Panel */}
        <ServicesControlPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          serviceFilter={serviceFilter}
          onFilterChange={setServiceFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredServices.length}
          totalCount={services.length}
          stats={stats}
          onCreateService={handleCreateService}
        />

        {/* Services Grid */}
        <ServicesGrid
          services={filteredServices.map((service) => ({
            ...service,
            _id: service._id.toString(),
            categoryId: service.categoryId.toString(),
          }))}
          viewMode={viewMode}
          isLoading={servicesLoading}
          onEditService={handleEditService}
          onDeleteService={handleServiceDelete}
          onToggleActive={handleServiceToggleActive}
          onTogglePopular={handleServiceTogglePopular}
          onCreateService={handleCreateService}
        />

        {/* Empty State */}
        {!servicesLoading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              {services.length === 0
                ? "No services found"
                : "No services match your filters"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {services.length === 0
                ? "This category doesn't have any services yet."
                : "Try adjusting your search or filter criteria."}
            </p>
            {services.length === 0 && (
              <Button onClick={handleCreateService}>
                Create First Service
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetailsPage;
