// services/admin/userManagementService.ts

import { AdminAuditLog } from "@/app/models/auth/adminModels";
import { User } from "@/app/models/auth/authModel";
import { invalidateUserSessions } from "@/auth";
import { connect } from "@/lib/dbconfigue/dbConfigue";

export interface UserSuspensionData {
  userId: string;
  reason: string;
  duration?: number; // in days, undefined for permanent
  suspendedBy: string;
  ipAddress?: string;
}

export interface UserListFilters {
  role?: string;
  status?: 'active' | 'suspended' | 'blocked';
  page?: number;
  limit?: number;
  search?: string;
}

// Define the MongoDB query type for better type safety
interface UserQuery {
  role?: string;
  status?: 'active' | 'suspended' | 'blocked' | 'deleted';
  $or?: Array<{
    email?: { $regex: string; $options: string };
    name?: { $regex: string; $options: string };
  }>;
}

// Define the MongoDB query type for better type safety
interface UserQuery {
  role?: string;
  status?: 'active' | 'suspended' | 'blocked' | 'deleted';
  $or?: Array<{
    email?: { $regex: string; $options: string };
    name?: { $regex: string; $options: string };
  }>;
}

/**
 * Gets a user by ID
 */
export async function getUserById(userId: string) {
  try {
    await connect();
    
    const user = await User.findById(userId)
      .select('-password') // Exclude password field
      .lean();
    
    return user;
    
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

/**
 * Suspends a user account
 */
export async function suspendUser(data: UserSuspensionData): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    // Verify admin permissions
    const admin = await User.findOne({ email: data.suspendedBy.toLowerCase() });
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const targetUser = await User.findById(data.userId);
    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }
    
    if (['admin', 'super_admin'].includes(targetUser.role) && admin.role !== 'super_admin') {
      return { success: false, error: 'Cannot suspend admin users unless you are super admin' };
    }
    
    const suspensionEndDate = data.duration 
      ? new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000)
      : undefined;
    
    const updatedUser = await User.findByIdAndUpdate(
      data.userId,
      {
        status: 'suspended',
        suspensionReason: data.reason,
        suspensionEndDate,
        suspendedBy: data.suspendedBy,
        suspendedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      // Log the action
      await AdminAuditLog.create({
        action: 'USER_SUSPENDED',
        adminEmail: data.suspendedBy,
        targetEmail: updatedUser.email,
        timestamp: new Date(),
        ipAddress: data.ipAddress,
        details: `User suspended. Reason: ${data.reason}${data.duration ? `, Duration: ${data.duration} days` : ' (Permanent)'}`
      });
      
      // Invalidate user sessions
      await invalidateUserSessions(data.userId);
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to suspend user' };
    
  } catch (error) {
    console.error('Error suspending user:', error);
    return { success: false, error: 'Failed to suspend user' };
  }
}

/**
 * Blocks a user account (more severe than suspension)
 */
export async function blockUser(
  adminEmail: string,
  userId: string,
  reason: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    const admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }
    
    if (['admin', 'super_admin'].includes(targetUser.role) && admin.role !== 'super_admin') {
      return { success: false, error: 'Cannot block admin users unless you are super admin' };
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        status: 'blocked',
        blockReason: reason,
        blockedBy: adminEmail,
        blockedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      await AdminAuditLog.create({
        action: 'USER_BLOCKED',
        adminEmail: adminEmail,
        targetEmail: updatedUser.email,
        timestamp: new Date(),
        ipAddress: ipAddress,
        details: `User blocked. Reason: ${reason}`
      });
      
      await invalidateUserSessions(userId);
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to block user' };
    
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, error: 'Failed to block user' };
  }
}

/**
 * Soft deletes a user account
 */
export async function deleteUser(
  adminEmail: string,
  userId: string,
  reason: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    const admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin || admin.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can delete users' };
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }
    
    if (targetUser.role === 'super_admin' && targetUser.email === adminEmail) {
      return { success: false, error: 'Cannot delete yourself' };
    }
    
    // Soft delete - mark as deleted but keep record
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        status: 'deleted',
        deletedBy: adminEmail,
        deletedAt: new Date(),
        deletionReason: reason,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      await AdminAuditLog.create({
        action: 'USER_DELETED',
        adminEmail: adminEmail,
        targetEmail: updatedUser.email,
        timestamp: new Date(),
        ipAddress: ipAddress,
        details: `User soft deleted. Reason: ${reason}`
      });
      
      await invalidateUserSessions(userId);
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to delete user' };
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Gets list of all users with filtering
 */
export async function getAllUsers(filters: UserListFilters = {}) {
  try {
    await connect();
    
    const {
      role,
      status = 'active',
      page = 1,
      limit = 50,
      search
    } = filters;
    
    const query: UserQuery = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('email name role status createdAt updatedAt suspendedBy suspendedAt blockReason')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);
    
    return {
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      }
    };
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], pagination: { current: 1, total: 0, count: 0 } };
  }
}

/**
 * Reactivates a suspended or blocked user
 */
export async function reactivateUser(
  adminEmail: string,
  userId: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    const admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin || !['admin', 'super_admin'].includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }
    
    if (targetUser.status === 'active') {
      return { success: false, error: 'User is already active' };
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        status: 'active',
        $unset: {
          suspensionReason: 1,
          suspensionEndDate: 1,
          suspendedBy: 1,
          suspendedAt: 1,
          blockReason: 1,
          blockedBy: 1,
          blockedAt: 1
        },
        reactivatedBy: adminEmail,
        reactivatedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      await AdminAuditLog.create({
        action: 'USER_REACTIVATED',
        adminEmail: adminEmail,
        targetEmail: updatedUser.email,
        timestamp: new Date(),
        ipAddress: ipAddress,
        details: 'User account reactivated'
      });
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to reactivate user' };
    
  } catch (error) {
    console.error('Error reactivating user:', error);
    return { success: false, error: 'Failed to reactivate user' };
  }
}