"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Service } from "@/store/types/dataTypes";

interface ServiceFormProps {
  initialData?: Service | null;
  categoryId?: string;
  categories: Array<{ _id: string; categoryName: string }>;
  onSubmit: (formData: ServiceFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
  errors?: Partial<ServiceFormData>;
}

export interface ServiceFormData {
  title: string;
  description: string;
  categoryId: string;
  serviceImage?: { url: string; serviceName: string };
  popular: boolean;
  isActive: boolean;
  tags: string[];
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  categoryId: propCategoryId,
  categories = [],
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
  errors = {},
}) => {
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    categoryId: propCategoryId || "",
    serviceImage: undefined,
    popular: false,
    isActive: true,
    tags: [],
  });

  // Initialize form data when initialData changes (edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId
          ? initialData.categoryId.toString()
          : "",
        serviceImage: initialData.serviceImage,
        popular: initialData.popular || false,
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
        tags: initialData.tags || [],
      });

      if (initialData.serviceImage?.url) {
        setImagePreview(initialData.serviceImage.url);
      }
    }
  }, [mode, initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImagePreview(url);
      setFormData((prev) => ({
        ...prev,
        serviceImage: { url, serviceName: file.name },
      }));
      setUploadedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();

      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up form data before submitting
    const submitData = { ...formData };

    // Handle uploaded file
    if (uploadedFile && imagePreview) {
      submitData.serviceImage = {
        url: imagePreview,
        serviceName: uploadedFile.name,
      };
    }

    // Remove empty serviceImage
    if (!submitData.serviceImage?.url) {
      submitData.serviceImage = undefined;
    }

    onSubmit(submitData);
  };

  const clearImage = () => {
    setImagePreview("");
    setUploadedFile(null);
    setFormData((prev) => ({ ...prev, serviceImage: undefined }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              errors.title
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Enter service title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              errors.description
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Enter service description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            disabled={!!propCategoryId}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              errors.categoryId
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } ${
              propCategoryId
                ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                : ""
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id.toString()} value={cat._id.toString()}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
          )}
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Service Image
          </h3>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Image
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 
                  rounded-xl bg-white dark:bg-gray-800
                  hover:border-blue-400 dark:hover:border-blue-500
                  hover:bg-blue-50 dark:hover:bg-blue-900/20
                  transition-all duration-200 ease-in-out
                  group-hover:shadow-md cursor-pointer"
              >
                <div className="text-center">
                  <div
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 
                      rounded-full flex items-center justify-center mb-4
                      group-hover:scale-110 transition-transform duration-200"
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Upload an image
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Drag and drop your image here, or click to browse
                  </p>
                  <div
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                      text-white text-sm font-medium rounded-lg
                      transition-colors duration-200 ease-in-out
                      group-hover:shadow-lg"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Choose File
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {imagePreview && (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="Preview"
                className="w-48 h-32 object-cover rounded-md border"
                width={192}
                height={128}
                onError={() => setImagePreview("")}
                unoptimized
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Type a tag and press Enter"
          />
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex space-x-6">
          {[
            { name: "popular", label: "Popular Service" },
            { name: "isActive", label: "Active" },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center">
              <input
                type="checkbox"
                name={name}
                checked={formData[name as keyof ServiceFormData] as boolean}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel || (() => window.history.back())}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 border rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading
              ? "Saving..."
              : mode === "create"
              ? "Create Service"
              : "Update Service"}
          </button>
        </div>
      </form>
    </div>
  );
};
