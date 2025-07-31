// src/components/admin/CategoryHeader.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BarChart3,
  Activity,
  Star,
  EyeOff,
  Tag,
  Edit3,
} from "lucide-react";
import Link from "next/link";

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  popular: number;
}

interface CategoryImage {
  url: string;
  catName: string;
}

interface Category {
  _id: string;
  categoryName: string;
  description?: string;
  tags?: string[];
  catImage?: CategoryImage;
}

interface CategoryHeaderProps {
  category: Category;
  stats: CategoryStats;
  onDeleteCategory: () => Promise<void>;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category, stats }) => {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>

          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/categories/${category._id}/edit`}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Edit3 size={20} />
            </Link>
          </div>
        </div>

        {/* Category Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 gap-6">
          {/* Category Image */}
          {category.catImage?.url && (
            <div className="flex-shrink-0">
              <Image
                src={category.catImage.url}
                alt={category.catImage.catName}
                width={120}
                height={120}
                className="w-32 h-32 sm:w-28 sm:h-28 lg:w-64 lg:h-64 object-cover rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                {category.categoryName}
              </h1>
              <Badge
                variant="secondary"
                className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mt-2 sm:mt-0 self-start"
              >
                Category
              </Badge>
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
              {category.description ||
                "No description provided for this category."}
            </p>

            {/* Tags */}
            {category.tags && category.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {category.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-sm border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 dark:text-blue-200 text-sm">
                      Total Services
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-200 dark:text-blue-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 dark:text-green-200 text-sm">
                      Active
                    </p>
                    <p className="text-2xl font-bold">{stats.active}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-200 dark:text-green-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 dark:text-yellow-200 text-sm">
                      Popular
                    </p>
                    <p className="text-2xl font-bold">{stats.popular}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-200 dark:text-yellow-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700 text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-100 dark:text-slate-200 text-sm">
                      Inactive
                    </p>
                    <p className="text-2xl font-bold">{stats.inactive}</p>
                  </div>
                  <EyeOff className="w-8 h-8 text-slate-200 dark:text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;
