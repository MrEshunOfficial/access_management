// src/components/admin/ServicesGrid.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Image as ImageIcon,
} from "lucide-react";

interface ServiceImage {
  url: string;
  serviceName: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  popular: boolean;
  tags?: string[];
  serviceImage?: ServiceImage;
}

interface ServicesGridProps {
  services: Service[];
  viewMode: "grid" | "list";
  isLoading: boolean;
  onEditService: (serviceId: string) => void;
  onDeleteService: (serviceId: string) => Promise<void>;
  onToggleActive: (serviceId: string) => Promise<void>;
  onTogglePopular: (serviceId: string) => Promise<void>;
  onCreateService: () => void;
}

// Tooltip component for showing full description
const DescriptionTooltip: React.FC<{
  description: string;
  children: React.ReactNode;
  className?: string;
}> = ({ description, children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className="fixed z-50 max-w-sm p-3 text-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          <div className="relative">
            {description}
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  viewMode,
  isLoading,
  onEditService,
  onDeleteService,
  onToggleActive,
  onTogglePopular,
  onCreateService,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="text-center py-16 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent>
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
            No services found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Get started by creating your first service
          </p>
          <Button
            onClick={onCreateService}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Service
          </Button>
        </CardContent>
      </Card>
    );
  }

  const ServiceDropdownMenu: React.FC<{ service: Service }> = ({ service }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            viewMode === "grid"
              ? "opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        <DropdownMenuItem
          onClick={() => onEditService(service._id)}
          className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Service
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
        <DropdownMenuItem
          onClick={() => onToggleActive(service._id)}
          className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {service.isActive ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onTogglePopular(service._id)}
          className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {service.popular ? (
            <>
              <StarOff className="w-4 h-4 mr-2" />
              Remove from Popular
            </>
          ) : (
            <>
              <Star className="w-4 h-4 mr-2" />
              Mark as Popular
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
        <DropdownMenuItem
          onClick={() => onDeleteService(service._id)}
          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Service
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const GridView: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
        <Card
          key={service._id}
          className="group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge
                    variant={service.isActive ? "default" : "secondary"}
                    className={
                      service.isActive
                        ? "bg-green-500 dark:bg-green-600"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {service.popular && (
                    <Badge
                      variant="outline"
                      className="border-yellow-400 dark:border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    >
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-slate-100">
                  {service.title}
                </CardTitle>
              </div>
              <ServiceDropdownMenu service={service} />
            </div>
          </CardHeader>

          <CardContent>
            {service.serviceImage?.url && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <Image
                  src={service.serviceImage.url}
                  alt={service.serviceImage.serviceName}
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <DescriptionTooltip description={service.description}>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 cursor-help">
                {service.description}
              </p>
            </DescriptionTooltip>

            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {service.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                  >
                    {tag}
                  </Badge>
                ))}
                {service.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                  >
                    +{service.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ListView: React.FC = () => (
    <div className="space-y-4">
      {services.map((service) => (
        <Card
          key={service._id}
          className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <div className="flex items-center p-4 gap-4">
            {/* Image Container - Fixed size with proper constraints */}
            <div className="flex-shrink-0 w-16 h-16">
              {service.serviceImage?.url ? (
                <div className="relative w-16 h-16 overflow-hidden rounded-lg">
                  <Image
                    src={service.serviceImage.url}
                    alt={service.serviceImage.serviceName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
              )}
            </div>

            {/* Content Container - Takes remaining space */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate text-slate-900 dark:text-slate-100">
                  {service.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={service.isActive ? "default" : "secondary"}
                    className={
                      service.isActive
                        ? "bg-green-500 dark:bg-green-600"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {service.popular && (
                    <Badge
                      variant="outline"
                      className="border-yellow-400 dark:border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    >
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                </div>
              </div>

              <DescriptionTooltip description={service.description}>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 cursor-help">
                  {service.description}
                </p>
              </DescriptionTooltip>

              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {service.tags.slice(0, 4).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {service.tags.length > 4 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                    >
                      +{service.tags.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Actions Container - Fixed position */}
            <div className="flex-shrink-0">
              <ServiceDropdownMenu service={service} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {viewMode === "grid" ? <GridView /> : <ListView />}
    </div>
  );
};

export default ServicesGrid;
