// lib/admin/management.ts - Admin panel backend functions

import { connect } from "../../dbconfigue/dbConfigue";
import { User } from "../../../app/models/auth/authModel";
import { AdminInvitation, AdminAuditLog } from "../../../app/models/auth/adminModels";
import { FilterQuery } from "mongoose";

export interface UserWithAdminInfo {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  status?: 'active' | 'suspended' | 'blocked' | 'deleted';
  isActive: boolean;
  createdAt: Date;
  promotedBy?: string;
  promotedAt?: Date;
  provider?: string;
  lastLogin?: Date;
}

export interface PendingInvitation {
  _id: string;
  email: string;
  role: 'admin' | 'super_admin';
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
  hoursRemaining: number;
}

// Define the User document interface for MongoDB queries
interface UserDocument {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  status?: 'active' | 'suspended' | 'blocked' | 'deleted';
  isActive: boolean;
  createdAt: Date;
  promotedBy?: string;
  promotedAt?: Date;
  provider?: string;
  lastLogin?: Date;
}

// Define the lean query result type (what Mongoose returns with .lean())
interface UserLeanResult {
  _id: unknown;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  status?: 'active' | 'suspended' | 'blocked' | 'deleted';
  isActive: boolean;
  createdAt: Date;
  promotedBy?: string;
  promotedAt?: Date;
  provider?: string;
}

/**
 * Get all users for admin panel (with pagination and filtering)
 */
export async function getAllUsersForAdmin(
  page: number = 1,
  limit: number = 20,
  search?: string,
  roleFilter?: 'all' | 'user' | 'admin' | 'super_admin',
  statusFilter?: 'all' | 'active' | 'suspended' | 'blocked' | 'deleted'
): Promise<{
  users: UserWithAdminInfo[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    await connect();
    
    const query: FilterQuery<UserDocument> = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (roleFilter && roleFilter !== 'all') {
      query.role = roleFilter;
    }

    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }
    
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    
    const users = await User.find(query)
      .select('email name role status isActive createdAt promotedBy promotedAt provider suspendedBy suspendedAt blockReason')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() as unknown as UserLeanResult[];
    
    return {
      users: users.map((user): UserWithAdminInfo => ({
        _id: user._id?.toString() || '',
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status || 'active',
        isActive: user.isActive,
        createdAt: user.createdAt,
        promotedBy: user.promotedBy,
        promotedAt: user.promotedAt,
        provider: user.provider
      })),
      totalUsers,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get admin statistics for dashboard
 */
export async function getAdminStats(): Promise<{
  totalUsers: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  pendingInvitations: number;
  recentSignups: number; // Last 7 days
}> {
  try {
    await connect();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [
      totalUsers,
      totalAdmins,
      totalSuperAdmins,
      pendingInvitations,
      recentSignups
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'super_admin' }),
      AdminInvitation.countDocuments({
        isUsed: false,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }),
      User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      })
    ]);
    
    return {
      totalUsers,
      totalAdmins,
      totalSuperAdmins,
      pendingInvitations,
      recentSignups
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw new Error('Failed to fetch admin statistics');
  }
}

/**
 * Send admin invitation by email (admin chooses email, doesn't need existing user)
 */
export async function sendAdminInvitationByEmail(
  adminEmail: string,
  inviteeEmail: string,
  role: 'admin' | 'super_admin',
): Promise<{ success: boolean; error?: string; invitationId?: string }> {
  try {
    await connect();
    
    // Import your existing createAdminInvitation function
    const { createAdminInvitation } = await import("../adminService");
    
    const result = await createAdminInvitation(
      adminEmail,
      inviteeEmail,
      role,
      72 // 72 hours expiration
    );
    
    if (result.success && result.invitationId) {
      // Here you would send the actual email
      // For now, we'll just log it
      console.log(`Admin invitation sent to ${inviteeEmail} by ${adminEmail}`);
      
      // In a real app, you'd use a service like:
      // await sendInvitationEmail(inviteeEmail, role, invitationToken, customMessage);
      
      return {
        success: true,
        invitationId: result.invitationId
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error sending admin invitation:', error);
    return { success: false, error: 'Failed to send invitation' };
  }
}

/**
 * Promote existing user to admin (from user list in admin panel)
 */
export async function promoteExistingUser(
  adminEmail: string,
  targetUserId: string,
  newRole: 'admin' | 'super_admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    // Get target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }
    
    // Import your existing promoteUserToAdmin function
    const { promoteUserToAdmin } = await import("../adminService");
    
    return await promoteUserToAdmin(adminEmail, targetUser.email, newRole);
  } catch (error) {
    console.error('Error promoting user:', error);
    return { success: false, error: 'Failed to promote user' };
  }
}

/**
 * Get all pending invitations for admin panel
 */
export async function getAllPendingInvitations(): Promise<PendingInvitation[]> {
  try {
    await connect();
    
    const invitations = await AdminInvitation.find({
      isUsed: false,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .lean();
    
    return invitations.map(inv => ({
      _id: inv._id.toString(),
      email: inv.email,
      role: inv.role,
      invitedBy: inv.invitedBy,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      hoursRemaining: Math.floor((inv.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60))
    }));
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return [];
  }
}

/**
 * Get recent admin activities for audit log
 */
export async function getRecentAdminActivities(limit: number = 50): Promise<unknown[]> {
  try {
    await connect();
    
    return await AdminAuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    return [];
  }
}
