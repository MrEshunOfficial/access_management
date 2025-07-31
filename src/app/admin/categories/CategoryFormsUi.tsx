import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCategories } from "@/hooks/admin/useCategory";
import {
  Category,
  UpdateCategoryInput,
  CreateCategoryInput,
} from "@/store/types/dataTypes";

interface CategoryFormsUiProps {
  category?: Category | null;
  isEditMode?: boolean;
  onSuccess?: (category: Category) => void;
  onCancel?: () => void;
}

interface FormErrors {
  categoryName?: string;
  description?: string;
  catImage?: string;
  general?: string;
}

interface CategoryImage {
  url: string;
  catName: string;
}

export default function CategoryFormsUi({
  category,
  isEditMode = false,
  onSuccess,
  onCancel,
}: CategoryFormsUiProps) {
  const { addCategory, editCategory, loading, error, clearCategoryError } =
    useCategories();

  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    catImage: null as CategoryImage | null,
    tags: [] as string[],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        categoryName: category.categoryName || "",
        description: category.description || "",
        catImage: category.catImage || null,
        tags: category.tags || [],
      });
      // Fix: Set image preview from category data
      if (category.catImage?.url) {
        setImagePreview(category.catImage.url);
      } else {
        setImagePreview("");
      }
    } else {
      resetForm();
    }
    setErrors({});
    clearCategoryError();
  }, [category, isEditMode, clearCategoryError]);

  const resetForm = () => {
    setFormData({
      categoryName: "",
      description: "",
      catImage: null,
      tags: [],
    });
    setImagePreview("");
    setTagInput("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        catImage: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        catImage: "Image size should be less than 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImagePreview(url);
      setFormData((prev) => ({
        ...prev,
        catImage: { url, catName: file.name },
      }));
    };
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, catImage: undefined }));
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = "Category name is required";
    } else if (formData.categoryName.trim().length < 2) {
      newErrors.categoryName = "Category name must be at least 2 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: undefined }));

    try {
      if (isEditMode && category) {
        const updateData: UpdateCategoryInput = {
          _id: category._id,
          categoryName: formData.categoryName.trim(),
          description: formData.description.trim() || undefined,
          catImage: formData.catImage || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        };

        const result = await editCategory(category._id.toString(), updateData);
        if (result.type.endsWith("/fulfilled")) {
          onSuccess?.(result.payload as Category);
        }
      } else {
        const createData: CreateCategoryInput = {
          categoryName: formData.categoryName.trim(),
          description: formData.description.trim() || undefined,
          catImage: formData.catImage || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        };

        const result = await addCategory(createData);
        if (result.type.endsWith("/fulfilled")) {
          onSuccess?.(result.payload as Category);
          resetForm();
        }
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      resetForm();
      setErrors({});
    }
  };

  // Fix: Handle image removal
  const handleImageRemove = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, catImage: null }));
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
      hasError
        ? "border-red-300 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400"
        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
    } disabled:opacity-50`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/20 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 dark:bg-blue-700 px-6 py-8">
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? "Edit Category" : "Create Category"}
            </h1>
            <p className="text-blue-100 dark:text-blue-200 mt-1">
              {isEditMode
                ? "Update your category information"
                : "Add a new category to organize content"}
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {(errors.general || error) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                    {errors.general || error}
                  </p>
                </div>
              )}

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  className={inputClass(!!errors.categoryName)}
                  placeholder="Enter category name"
                  disabled={isSubmitting || loading}
                />
                {errors.categoryName && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.categoryName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={inputClass(!!errors.description)}
                  placeholder="Enter category description"
                  disabled={isSubmitting || loading}
                />
                <div className="flex justify-between mt-1">
                  {errors.description ? (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.description}
                    </p>
                  ) : (
                    <div />
                  )}
                  <p
                    className={`text-sm ${
                      formData.description.length > 400
                        ? "text-red-500 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isSubmitting || loading}
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-white dark:bg-gray-800">
                    <div className="text-gray-600 dark:text-gray-400">
                      <p className="font-medium">
                        {imagePreview
                          ? "Click to change image"
                          : "Click to upload image"}
                      </p>
                      <p className="text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-4 relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                      disabled={isSubmitting || loading}
                    >
                      ×
                    </button>
                  </div>
                )}

                {errors.catImage && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.catImage}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex rounded-lg border-2 border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 bg-white dark:bg-gray-800">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tags (press Enter)"
                    className="flex-1 px-4 py-3 focus:outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={isSubmitting || loading}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
                    disabled={!tagInput.trim() || isSubmitting || loading}
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                          disabled={isSubmitting || loading}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 border border-gray-300 dark:border-gray-600"
                  disabled={isSubmitting || loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 flex items-center"
                  disabled={isSubmitting || loading}
                >
                  {(isSubmitting || loading) && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  {isEditMode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
