// app/admin/categories/Uicomponents/DeleteCategoryModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useCategories } from "@/hooks/admin/useCategory";

interface DeleteCategoryModalProps {
  categoryId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type DeleteMode = "simple" | "safe" | "cascade" | "migrate" | "force";

export default function DeleteCategoryModal({
  categoryId,
  onClose,
  onSuccess,
}: DeleteCategoryModalProps) {
  const {
    categories,
    loading,
    getDeletionInfo,
    removeCategorySimple,
    removeCategorySafely,
    removeCategoryCascade,
    removeCategoryWithMigration,
    removeCategoryForce,
    clearCategoryDeletionInfo,
    getDeletionSummary,
  } = useCategories();

  const [deleteMode, setDeleteMode] = useState<DeleteMode>("simple");
  const [selectedMigrationTarget, setSelectedMigrationTarget] =
    useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Get current category info
  const currentCategory = categories.find(
    (cat) => cat._id.toString() === categoryId
  );
  const availableMigrationTargets = categories.filter(
    (cat) => cat._id.toString() !== categoryId
  );
  const deletionSummary = getDeletionSummary();

  useEffect(() => {
    if (categoryId) {
      getDeletionInfo(categoryId);
    }
    return () => {
      clearCategoryDeletionInfo();
    };
  }, [categoryId, getDeletionInfo, clearCategoryDeletionInfo]);

  useEffect(() => {
    if (deletionSummary) {
      // Auto-select recommended deletion mode
      if (deletionSummary.canDeleteSafely) {
        setDeleteMode("simple");
      } else if (deletionSummary.serviceCount > 0) {
        setDeleteMode("migrate");
        setShowAdvancedOptions(true);
      }
    }
  }, [deletionSummary]);

  const handleDelete = async () => {
    if (!categoryId) return;

    setIsDeleting(true);
    try {
      switch (deleteMode) {
        case "simple":
          await removeCategorySimple(categoryId);
          break;
        case "safe":
          await removeCategorySafely(categoryId);
          break;
        case "cascade":
          await removeCategoryCascade(categoryId);
          break;
        case "migrate":
          if (!selectedMigrationTarget) {
            throw new Error("Please select a migration target category");
          }
          await removeCategoryWithMigration(
            categoryId,
            selectedMigrationTarget
          );
          break;
        case "force":
          await removeCategoryForce(categoryId);
          break;
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeleteModeInfo = (mode: DeleteMode) => {
    switch (mode) {
      case "simple":
        return {
          title: "Simple Delete",
          description: "Delete category only if it has no associated services",
          icon: ExclamationTriangleIcon,
          color: "text-yellow-500",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        };
      case "safe":
        return {
          title: "Safe Delete",
          description:
            "Delete category and unassign services (services keep their data)",
          icon: InformationCircleIcon,
          color: "text-blue-500",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "cascade":
        return {
          title: "Cascade Delete",
          description:
            "Delete category and all associated services permanently",
          icon: ExclamationTriangleIcon,
          color: "text-red-500",
          bgColor: "bg-red-100 dark:bg-red-900/30",
        };
      case "migrate":
        return {
          title: "Migrate & Delete",
          description:
            "Move services to another category, then delete this one",
          icon: ArrowRightIcon,
          color: "text-green-500",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        };
      case "force":
        return {
          title: "Force Delete",
          description: "Force delete regardless of associations (dangerous)",
          icon: ExclamationTriangleIcon,
          color: "text-red-600",
          bgColor: "bg-red-100 dark:bg-red-900/30",
        };
    }
  };

  if (!categoryId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Category
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentCategory?.categoryName}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-6 space-y-6">
            {/* Deletion Info */}
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              </div>
            ) : (
              deletionSummary && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Category Information
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Services:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {deletionSummary.serviceCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Can delete safely:
                      </span>
                      <span
                        className={`font-medium ${
                          deletionSummary.canDeleteSafely
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {deletionSummary.canDeleteSafely ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Recommended:
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400 capitalize">
                        {deletionSummary.recommendedAction}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Delete Mode Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Deletion Method
                </h4>
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
                </button>
              </div>

              <div className="space-y-3">
                {/* Simple/Safe options - always visible */}
                {["simple", "safe", "migrate"].map((mode) => {
                  const modeInfo = getDeleteModeInfo(mode as DeleteMode);
                  const IconComponent = modeInfo.icon;

                  return (
                    <div key={mode}>
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          deleteMode === mode
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deleteMode"
                          value={mode}
                          checked={deleteMode === mode}
                          onChange={(e) =>
                            setDeleteMode(e.target.value as DeleteMode)
                          }
                          className="mt-1"
                        />
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${modeInfo.bgColor}`}
                        >
                          <IconComponent
                            className={`w-4 h-4 ${modeInfo.color}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {modeInfo.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {modeInfo.description}
                          </div>
                        </div>
                      </motion.label>

                      {/* Migration target selection */}
                      {mode === "migrate" && deleteMode === "migrate" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="ml-12 mt-3"
                        >
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select target category:
                          </label>
                          <select
                            value={selectedMigrationTarget}
                            onChange={(e) =>
                              setSelectedMigrationTarget(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Choose a category...</option>
                            {availableMigrationTargets.map((category) => (
                              <option
                                key={category._id.toString()}
                                value={category._id.toString()}
                              >
                                {category.categoryName}
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </div>
                  );
                })}

                {/* Advanced options */}
                <AnimatePresence>
                  {showAdvancedOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {["cascade", "force"].map((mode) => {
                        const modeInfo = getDeleteModeInfo(mode as DeleteMode);
                        const IconComponent = modeInfo.icon;

                        return (
                          <motion.label
                            key={mode}
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              deleteMode === mode
                                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deleteMode"
                              value={mode}
                              checked={deleteMode === mode}
                              onChange={(e) =>
                                setDeleteMode(e.target.value as DeleteMode)
                              }
                              className="mt-1"
                            />
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${modeInfo.bgColor}`}
                            >
                              <IconComponent
                                className={`w-4 h-4 ${modeInfo.color}`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {modeInfo.title}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {modeInfo.description}
                              </div>
                            </div>
                          </motion.label>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Warning for destructive actions */}
            {(deleteMode === "cascade" || deleteMode === "force") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-800 dark:text-red-200">
                    Warning: This action is irreversible
                  </span>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {deleteMode === "cascade"
                    ? "All services in this category will be permanently deleted."
                    : "This will force delete the category and may cause data inconsistencies."}
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              disabled={
                isDeleting ||
                (deleteMode === "migrate" && !selectedMigrationTarget) ||
                loading
              }
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                deleteMode === "cascade" || deleteMode === "force"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isDeleting
                ? "Deleting..."
                : `Delete ${deleteMode === "migrate" ? "& Migrate" : ""}`}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
