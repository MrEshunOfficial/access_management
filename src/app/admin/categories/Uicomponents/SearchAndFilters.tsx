// components/SearchAndFilters.tsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { CategoryQueryOptions } from "@/lib/admin/services/categoryService";

interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Partial<CategoryQueryOptions>) => void;
  filters: CategoryQueryOptions;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  onSearch,
  onFilterChange,
  filters,
  viewMode,
  onViewModeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as CategoryQueryOptions["sortBy"],
              })
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Recent</option>
            <option value="categoryName">Name</option>
            <option value="updatedAt">Updated</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={(e) =>
              onFilterChange({
                sortOrder: e.target.value as CategoryQueryOptions["sortOrder"],
              })
            }
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">↓ Desc</option>
            <option value="asc">↑ Asc</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              } transition-colors rounded-l-lg`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              } transition-colors rounded-r-lg`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchAndFilters;
