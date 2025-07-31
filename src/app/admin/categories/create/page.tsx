"use client";

import React from "react";
import CategoryFormsUi from "../CategoryFormsUi";
import { useRouter } from "next/navigation";
import { Category } from "@/store/types/dataTypes";

export default function CreateCategoryPage() {
  const router = useRouter();

  const handleSuccess = (category: Category) => {
    // Show success message (you can use a toast library here)
    console.log("Category created successfully:", category);

    // Redirect to categories list or category detail page
    // router.push("/admin");
    // Or redirect to the newly created category's detail page:
    router.push(`/admin/categories/${category._id}`);
  };

  const handleCancel = () => {
    // Navigate back to categories list
    router.push("/admin");
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <button
                onClick={() => router.push("/admin")}
                className="hover:text-gray-700 dark:hover:text-gray-200 underline"
              >
                Categories
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              Create New Category
            </li>
          </ol>
        </nav>

        {/* Form Component */}
        <CategoryFormsUi
          isEditMode={false}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
