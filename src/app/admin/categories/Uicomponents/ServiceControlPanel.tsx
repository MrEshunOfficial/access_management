// src/components/admin/ServicesControlPanel.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Activity,
  EyeOff,
  Star,
} from "lucide-react";

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  popular: number;
}

interface ServicesControlPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  serviceFilter: "all" | "active" | "inactive" | "popular";
  onFilterChange: (filter: "all" | "active" | "inactive" | "popular") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  filteredCount: number;
  totalCount: number;
  stats: CategoryStats;
  onCreateService: () => void;
}

const ServicesControlPanel: React.FC<ServicesControlPanelProps> = ({
  searchQuery,
  onSearchChange,
  serviceFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
  stats,
  onCreateService,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Services Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage all services in this category ({filteredCount} of{" "}
            {totalCount} shown)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={onCreateService}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0 mt-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
          <Input
            placeholder="Search services by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter: {serviceFilter === "all" ? "All" : serviceFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            >
              <DropdownMenuLabel className="text-slate-900 dark:text-slate-100">
                Filter Services
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                onClick={() => onFilterChange("all")}
                className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                All Services ({stats.total})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange("active")}
                className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Activity className="w-4 h-4 mr-2" />
                Active ({stats.active})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange("inactive")}
                className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Inactive ({stats.inactive})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange("popular")}
                className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Star className="w-4 h-4 mr-2" />
                Popular ({stats.popular})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg p-1 bg-white dark:bg-slate-800">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={`h-8 ${
                viewMode === "grid"
                  ? "bg-slate-900 dark:bg-slate-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={`h-8 ${
                viewMode === "list"
                  ? "bg-slate-900 dark:bg-slate-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesControlPanel;
