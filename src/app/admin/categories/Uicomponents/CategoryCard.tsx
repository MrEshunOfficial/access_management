// components/CategoryCard.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Folder,
  Calendar,
  Tag,
  BarChart3,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Category } from "@/store/types/dataTypes";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  index: number;
  viewMode: "grid" | "list";
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  index,
  viewMode,
}) => {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const modernGradients = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
    "from-violet-500 to-violet-600",
    "from-rose-500 to-rose-600",
    "from-indigo-500 to-indigo-600",
  ];

  const fallbackGradient = modernGradients[index % modernGradients.length];
  const serviceCount =
    category.serviceCount || category.serviceIds?.length || 0;

  // Handle action clicks - prevent event bubbling
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(category);
    setShowActions(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(category._id.toString());
    setShowActions(false);
  };

  const handleActionsToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActions(!showActions);
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Category Image/Icon */}
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden">
              {category.catImage?.url && !imageError ? (
                <Image
                  src={category.catImage.url}
                  alt={category.catImage.catName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}
                >
                  <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {category.categoryName}
                  </h3>
                  {serviceCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full mt-1">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {serviceCount} Services
                    </span>
                  )}
                </div>

                {/* Mobile Actions Menu */}
                <div className="relative sm:hidden">
                  <button
                    onClick={handleActionsToggle}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showActions && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                      <button
                        onClick={handleEditClick}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                      <Link
                        href={`/admin/categories/${category._id}`}
                        className="w-full flex items-center px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                {category.description || "No description available"}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                  <span className="sm:hidden">
                    {new Date(category.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </span>
                {category.tags && category.tags.length > 0 && (
                  <span className="flex items-center">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {category.tags.length} Tags
                  </span>
                )}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex flex-shrink-0 items-center gap-2">
              <button
                onClick={handleEditClick}
                className="inline-flex items-center px-2 lg:px-3 py-1.5 lg:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-medium rounded-lg transition-colors"
              >
                <Edit className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                <span className="hidden lg:inline">Edit</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center px-2 lg:px-3 py-1.5 lg:py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 text-xs lg:text-sm font-medium rounded-lg transition-colors"
              >
                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                <span className="hidden lg:inline">Delete</span>
              </button>
              <Link
                href={`/admin/categories/${category._id}`}
                className="inline-flex items-center px-2 lg:px-4 py-1.5 lg:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm font-medium rounded-lg transition-colors"
              >
                <span className="hidden sm:inline lg:mr-2">View</span>
                <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile View Details Button */}
        <div className="sm:hidden border-t border-gray-100 dark:border-gray-700 px-3 py-2">
          <Link
            href={`/admin/categories/${category._id}`}
            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative">
      <div className="block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl h-64 sm:h-72 lg:h-80 transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        {/* Background */}
        <div className="absolute inset-0">
          {category.catImage?.url && !imageError ? (
            <Image
              src={category.catImage.url}
              alt={category.catImage.catName}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}
            >
              <Folder className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white opacity-80" />
            </div>
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 group-hover:from-black/80 group-hover:to-black/30 transition-all duration-500" />

        {/* Content */}
        <div className="absolute inset-0 p-3 sm:p-4 lg:p-6 flex flex-col justify-between text-white z-10">
          {/* Top - Service Count & Tags */}
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
              <BarChart3 className="w-3 h-3 mr-1" />
              {serviceCount} Services
            </span>
            {category.tags && category.tags.length > 0 && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full text-xs font-bold">
                <Tag className="w-3 h-3 mr-1" />
                {category.tags.length}
              </span>
            )}
          </div>

          {/* Bottom - Category Info */}
          <div className="space-y-2 sm:space-y-3">
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 leading-tight line-clamp-2">
                {category.categoryName}
              </h3>
              <p className="text-white/90 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {category.description || "No description available"}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/80 mb-2 sm:mb-3">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">
                {new Date(category.createdAt).toLocaleDateString()}
              </span>
              <span className="sm:hidden">
                {new Date(category.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleEditClick}
                className="inline-flex items-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-300 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold"
              >
                <Edit className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center bg-red-500/80 backdrop-blur-sm hover:bg-red-500/90 transition-colors duration-300 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold"
              >
                <Trash2 className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <Link
                href={`/admin/categories/${category._id}`}
                className="inline-flex items-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-300 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold flex-1 sm:flex-initial justify-center"
              >
                <span className="sm:mr-2">View Details</span>
                <ArrowRight className="ml-1 sm:ml-0 w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
