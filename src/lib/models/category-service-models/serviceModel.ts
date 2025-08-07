// src/models/category-service-models/serviceModel.ts
import { Service } from "@/store/types/dataTypes";
import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface IServiceDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  categoryId: Types.ObjectId;
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular: boolean;
  isActive: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define a lean document type for when using .lean()
export interface IServiceLean {
  _id: Types.ObjectId;
  title: string;
  description: string;
  categoryId: Types.ObjectId;
  serviceImage?: {
    url: string;
    serviceName: string;
  };
  popular: boolean;
  isActive: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const serviceSchema = new Schema<IServiceDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Increased to match typical service descriptions
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    serviceImage: {
      url: {
        type: String,
        trim: true,
      },
      serviceName: {
        type: String,
        trim: true,
      },
    },
    popular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        // Keep ObjectIds as they are for consistency with your types
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        // Keep ObjectIds as they are for consistency with your types
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ popular: -1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ title: "text", description: "text", tags: "text" });
serviceSchema.index({ createdAt: -1 });

// Compound indexes for common queries
serviceSchema.index({ categoryId: 1, isActive: 1, popular: -1 });

// Virtual for populated category
serviceSchema.virtual("category", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
});

// Static method to transform lean document to Service interface
serviceSchema.statics.transformLeanToService = function (
  doc: IServiceLean
): Service {
  if (!doc) return doc;
  return {
    _id: doc._id,
    title: doc.title,
    description: doc.description,
    categoryId: doc.categoryId,
    serviceImage: doc.serviceImage,
    popular: doc.popular,
    isActive: doc.isActive,
    tags: doc.tags,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// Post-save middleware to update category serviceIds and serviceCount
serviceSchema.post("save", async function (doc) {
  try {
    // Import here to avoid circular dependencies
    const { CategoryModel } = await import("./categoryModel");
    
    // Check if this service is already in the category's serviceIds
    const category = await CategoryModel.findById(doc.categoryId);
    if (category && !category.serviceIds.includes(doc._id)) {
      await CategoryModel.findByIdAndUpdate(doc.categoryId, {
        $addToSet: { serviceIds: doc._id },
        $inc: { serviceCount: 1 },
      });
    }
  } catch (error) {
    console.error("Error updating category after service save:", error);
  }
});

// Post-remove middleware to update category serviceIds and serviceCount
serviceSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      // Import here to avoid circular dependencies
      const { CategoryModel } = await import("./categoryModel");
      await CategoryModel.findByIdAndUpdate(doc.categoryId, {
        $pull: { serviceIds: doc._id },
        $inc: { serviceCount: -1 },
      });
    } catch (error) {
      console.error("Error updating category after service deletion:", error);
    }
  }
});

// Add the static method to the interface
export interface IServiceModel extends Model<IServiceDocument> {
  transformLeanToService(doc: IServiceLean): Service;
}

// Safe model export that works in both server and client environments
let ServiceModel: IServiceModel;

if (typeof window === 'undefined') {
  // Server-side: use normal Mongoose model creation
  ServiceModel = (models?.Service as IServiceModel) || 
    model<IServiceDocument, IServiceModel>("Service", serviceSchema);
} else {
  // Client-side: create a mock model to prevent errors
  ServiceModel = {
    transformLeanToService: (doc: IServiceLean): Service => {
      if (!doc) return doc;
      return {
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        categoryId: doc.categoryId,
        serviceImage: doc.serviceImage,
        popular: doc.popular,
        isActive: doc.isActive,
        tags: doc.tags,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    }
  } as IServiceModel;
}

export { ServiceModel };