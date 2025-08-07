// app/models/auth/adminModels.ts - Database models for secure admin management

import mongoose, { Schema, Document, Model, CallbackError } from 'mongoose';

// Admin Invitation Model
export interface IAdminInvitation extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: 'admin' | 'super_admin';
  invitedBy: string;
  invitationToken: string;
  expiresAt: Date;
  isUsed: boolean;
  isActive: boolean;
  usedAt?: Date;
  revokedBy?: string;
  revokedAt?: Date;
  createdAt: Date;
  
  // Instance methods
  markAsUsed(usedBy?: string): Promise<IAdminInvitation>;
  revoke(revokedBy: string): Promise<IAdminInvitation>;
  isValid(): boolean;
  
  // Virtual properties
  readonly isExpired: boolean;
  readonly timeRemaining: number;
  readonly hoursRemaining: number;
}

// Admin Audit Log Model
export interface IAdminAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
 action: 'USER_SUSPENDED' | 'USER_BLOCKED' | 'USER_DELETED' | 'USER_REACTIVATED' | 'USER_PROMOTED' | 'USER_DEMOTED' | 'INVITATION_CREATED' | 'INVITATION_USED' | 'INVITATION_REVOKED' | 'ADMIN_LOGIN' | 'ADMIN_LOGOUT' | 'PERMISSION_CHANGED' | 'RESTORE_USER';
  adminEmail?: string;
  targetEmail?: string;
  invitedBy?: string;
  role?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

// Extended interfaces for static methods
export interface IAdminInvitationModel extends Model<IAdminInvitation> {
  cleanupExpired(): Promise<mongoose.UpdateWriteOpResult>;
  getActiveInvitations(email?: string): Promise<IAdminInvitation[]>;
  findValidInvitation(email: string, token?: string): Promise<IAdminInvitation | null>;
  scheduleCleanup(): void;
}

export interface IAdminAuditLogModel extends Model<IAdminAuditLog> {
  logAction(logData: Partial<IAdminAuditLog>): Promise<IAdminAuditLog | null>;
  getRecentLogs(limit?: number, filters?: Record<string, unknown>): Promise<IAdminAuditLog[]>;
  getLogsByUser(email: string, limit?: number): Promise<IAdminAuditLog[]>;
  getLogsByAction(action: string, limit?: number): Promise<IAdminAuditLog[]>;
}

const AdminInvitationSchema = new Schema<IAdminInvitation, IAdminInvitationModel>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  invitedBy: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  invitationToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  usedAt: {
    type: Date
  },
  revokedBy: {
    type: String,
    lowercase: true,
    trim: true
  },
  revokedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdminAuditLogSchema = new Schema<IAdminAuditLog, IAdminAuditLogModel>({
  action: {
    type: String,
    required: true,
    enum: [
      'USER_SUSPENDED',
      'USER_BLOCKED',
      'USER_DELETED',
      'USER_REACTIVATED',
      'USER_PROMOTED',
      'USER_DEMOTED', 
      'INVITATION_CREATED',
      'INVITATION_USED',
      'INVITATION_REVOKED',
      'ADMIN_LOGIN',
      'ADMIN_LOGOUT',
      'PERMISSION_CHANGED',
      'RESTORE_USER',
    ],
    index: true
  },
  adminEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  targetEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  invitedBy: {
    type: String,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed
  }
});

// Compound indexes for better query performance
AdminInvitationSchema.index({ email: 1, isUsed: 1, isActive: 1, expiresAt: 1 });
AdminInvitationSchema.index({ invitedBy: 1, createdAt: -1 });

// Indexes for audit log queries
AdminAuditLogSchema.index({ timestamp: -1 });
AdminAuditLogSchema.index({ adminEmail: 1, timestamp: -1 });
AdminAuditLogSchema.index({ targetEmail: 1, timestamp: -1 });
AdminAuditLogSchema.index({ action: 1, timestamp: -1 });

// Pre-save middleware to ensure data integrity
AdminInvitationSchema.pre('save', function(next: (err?: CallbackError) => void) {
  // Validate expiration date
  if (this.expiresAt && this.expiresAt <= new Date()) {
    this.isActive = false;
  }
  
  // Ensure used invitations are marked appropriately
  if (this.isUsed && !this.usedAt) {
    this.usedAt = new Date();
  }
  
  // Ensure revoked invitations are marked appropriately
  if (!this.isActive && this.revokedBy && !this.revokedAt) {
    this.revokedAt = new Date();
  }
  
  next();
});

// Static methods for AdminInvitation
AdminInvitationSchema.statics.cleanupExpired = async function(this: IAdminInvitationModel) {
  const now = new Date();
  return await this.updateMany(
    { 
      expiresAt: { $lt: now },
      isUsed: false,
      isActive: true 
    },
    { 
      isActive: false,
      revokedAt: now,
      revokedBy: 'system'
    }
  );
};

AdminInvitationSchema.statics.getActiveInvitations = async function(this: IAdminInvitationModel, email?: string) {
  const query: Record<string, unknown> = {
    isUsed: false,
    isActive: true,
    expiresAt: { $gt: new Date() }
  };
  
  if (email) {
    query.email = email.toLowerCase();
  }
  
  return await this.find(query).sort({ createdAt: -1 });
};

AdminInvitationSchema.statics.findValidInvitation = async function(this: IAdminInvitationModel, email: string, token?: string) {
  const query: Record<string, unknown> = {
    email: email.toLowerCase(),
    isUsed: false,
    isActive: true,
    expiresAt: { $gt: new Date() }
  };
  
  if (token) {
    query.invitationToken = token;
  }
  
  return await this.findOne(query);
};

AdminInvitationSchema.statics.scheduleCleanup = function(this: IAdminInvitationModel) {
  setInterval(async () => {
    try {
      await this.cleanupExpired();
      console.log('Expired admin invitations cleaned up');
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
    }
  }, 24 * 60 * 60 * 1000); // Run daily
};

// Static methods for AdminAuditLog
AdminAuditLogSchema.statics.logAction = async function(this: IAdminAuditLogModel, logData: Partial<IAdminAuditLog>) {
  try {
    return await this.create({
      ...logData,
      timestamp: logData.timestamp || new Date()
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
};

AdminAuditLogSchema.statics.getRecentLogs = async function(this: IAdminAuditLogModel, limit: number = 100, filters?: Record<string, unknown>) {
  const query = filters || {};
  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

AdminAuditLogSchema.statics.getLogsByUser = async function(this: IAdminAuditLogModel, email: string, limit: number = 50) {
  return await this.find({
    $or: [
      { adminEmail: email.toLowerCase() },
      { targetEmail: email.toLowerCase() }
    ]
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .lean();
};

AdminAuditLogSchema.statics.getLogsByAction = async function(this: IAdminAuditLogModel, action: string, limit: number = 50) {
  return await this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Instance methods for AdminInvitation
AdminInvitationSchema.methods.markAsUsed = async function(this: IAdminInvitation, usedBy?: string) {
  this.isUsed = true;
  this.usedAt = new Date();
  if (usedBy) {
    this.revokedBy = usedBy;
  }
  return await this.save();
};

AdminInvitationSchema.methods.revoke = async function(this: IAdminInvitation, revokedBy: string) {
  this.isActive = false;
  this.revokedBy = revokedBy;
  this.revokedAt = new Date();
  return await this.save();
};

AdminInvitationSchema.methods.isValid = function(this: IAdminInvitation) {
  return !this.isUsed && 
         this.isActive && 
         this.expiresAt > new Date();
};

// Virtual properties
AdminInvitationSchema.virtual('isExpired').get(function(this: IAdminInvitation) {
  return this.expiresAt <= new Date();
});

AdminInvitationSchema.virtual('timeRemaining').get(function(this: IAdminInvitation) {
  const now = new Date();
  const remaining = this.expiresAt.getTime() - now.getTime();
  return Math.max(0, remaining);
});

AdminInvitationSchema.virtual('hoursRemaining').get(function(this: IAdminInvitation) {
  return Math.floor(this.timeRemaining / (1000 * 60 * 60));
});

// Ensure virtuals are included in JSON output
AdminInvitationSchema.set('toJSON', { virtuals: true });
AdminInvitationSchema.set('toObject', { virtuals: true });

AdminAuditLogSchema.set('toJSON', { virtuals: true });
AdminAuditLogSchema.set('toObject', { virtuals: true });

// Export models with proper typing
export const AdminInvitation = (mongoose.models.AdminInvitation || 
  mongoose.model<IAdminInvitation, IAdminInvitationModel>('AdminInvitation', AdminInvitationSchema)) as IAdminInvitationModel;

export const AdminAuditLog = (mongoose.models.AdminAuditLog || 
  mongoose.model<IAdminAuditLog, IAdminAuditLogModel>('AdminAuditLog', AdminAuditLogSchema)) as IAdminAuditLogModel;

// Helper function to initialize cleanup on app start
export function initializeAdminModels(): void {
  // Start the cleanup scheduler
  AdminInvitation.scheduleCleanup();
  
  // Clean up any expired invitations on startup
  AdminInvitation.cleanupExpired().catch(console.error);
}