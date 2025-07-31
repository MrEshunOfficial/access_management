// adminService.ts - Admin management functions
import { AdminInvitation, AdminAuditLog } from "@/app/models/auth/adminModels";
import crypto from "crypto";
import { connect } from "../dbconfigue/dbConfigue";
import { User } from "@/app/models/auth/authModel";

/**
 * Creates an admin invitation for a user
 */
export async function createAdminInvitation(
  inviterEmail: string, 
  inviteeEmail: string, 
  role: 'admin' | 'super_admin' = 'admin',
  expirationHours: number = 72,
  ipAddress?: string
): Promise<{ success: boolean; invitationId?: string; error?: string }> {
  try {
    await connect();
    
    const inviter = await User.findOne({ email: inviterEmail.toLowerCase() });
    if (!inviter || !['admin', 'super_admin'].includes(inviter.role)) {
      return { success: false, error: 'Insufficient permissions to create invitations' };
    }
    
    if (role === 'super_admin' && inviter.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can create super admin invitations' };
    }
    
    const existingUser = await User.findOne({ email: inviteeEmail.toLowerCase() });
    if (existingUser && ['admin', 'super_admin'].includes(existingUser.role)) {
      return { success: false, error: 'User already has admin privileges' };
    }
    
    const existingInvitation = await AdminInvitation.findOne({
      email: inviteeEmail.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() },
      isActive: true
    });
    
    if (existingInvitation) {
      return { success: false, error: 'Active invitation already exists for this email' };
    }
    
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);
    
    const invitation = await AdminInvitation.create({
      email: inviteeEmail.toLowerCase(),
      role: role,
      invitedBy: inviterEmail,
      invitationToken: invitationToken,
      expiresAt: expiresAt,
      isUsed: false,
      isActive: true,
      createdAt: new Date()
    });
    
    await AdminAuditLog.create({
      action: 'INVITATION_CREATED',
      adminEmail: inviterEmail,
      targetEmail: inviteeEmail,
      role: role,
      timestamp: new Date(),
      ipAddress: ipAddress,
      details: `Admin invitation created for role: ${role}, expires: ${expiresAt.toISOString()}`
    });
    
    return { 
      success: true, 
      invitationId: invitation._id.toString()
    };
    
  } catch (error) {
    console.error('Error creating admin invitation:', error);
    return { success: false, error: 'Failed to create invitation' };
  }
}

/**
 * Promotes a user to admin role
 */
export async function promoteUserToAdmin(
  adminEmail: string, 
  targetEmail: string, 
  newRole: 'admin' | 'super_admin' = 'admin',
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    const promoter = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!promoter || !['admin', 'super_admin'].includes(promoter.role)) {
      return { success: false, error: 'Insufficient permissions to promote users' };
    }
    
    if (newRole === 'super_admin' && promoter.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can promote to super admin' };
    }
    
    const targetUser = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!targetUser) {
      return { success: false, error: 'Target user not found' };
    }
    
    if (targetUser.role === newRole) {
      return { success: false, error: `User already has ${newRole} role` };
    }
    
    if (adminEmail.toLowerCase() === targetEmail.toLowerCase() && newRole === 'super_admin') {
      return { success: false, error: 'Cannot promote yourself to super admin' };
    }
    
    const oldRole = targetUser.role;
    
    const updatedUser = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase() },
      { 
        role: newRole,
        updatedAt: new Date(),
        promotedBy: adminEmail,
        promotedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      await AdminAuditLog.create({
        action: 'USER_PROMOTED',
        adminEmail: adminEmail,
        targetEmail: targetEmail,
        role: newRole,
        timestamp: new Date(),
        ipAddress: ipAddress,
        details: `User promoted from ${oldRole} to ${newRole}`
      });
      
      // Import invalidateUserSessions from auth.ts if needed
      // await invalidateUserSessions(updatedUser._id.toString());
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to update user role' };
    
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error: 'Failed to promote user' };
  }
}

/**
 * Demotes an admin to regular user
 */
export async function demoteAdminToUser(
  adminEmail: string, 
  targetEmail: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    const demoter = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!demoter || !['admin', 'super_admin'].includes(demoter.role)) {
      return { success: false, error: 'Insufficient permissions to demote users' };
    }
    
    const targetUser = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!targetUser) {
      return { success: false, error: 'Target user not found' };
    }
    
    if (adminEmail.toLowerCase() === targetEmail.toLowerCase()) {
      if (targetUser.role === 'super_admin') {
        const superAdminCount = await User.countDocuments({ role: 'super_admin' });
        if (superAdminCount <= 1) {
          return { success: false, error: 'Cannot demote yourself as the only super admin' };
        }
      }
    }
    
    if (targetUser.role === 'super_admin' && demoter.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can demote super admins' };
    }
    
    if (targetUser.role === 'user') {
      return { success: false, error: 'User is already a regular user' };
    }
    
    const oldRole = targetUser.role;
    
    const updatedUser = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase() },
      { 
        role: 'user',
        updatedAt: new Date(),
        demotedBy: adminEmail,
        demotedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedUser) {
      await AdminAuditLog.create({
        action: 'USER_DEMOTED',
        adminEmail: adminEmail,
        targetEmail: targetEmail,
        role: 'user',
        timestamp: new Date(),
        ipAddress: ipAddress,
        details: `User demoted from ${oldRole} to user`
      });
      
      // Import invalidateUserSessions from auth.ts if needed
      // await invalidateUserSessions(updatedUser._id.toString());
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to update user role' };
    
  } catch (error) {
    console.error('Error demoting admin to user:', error);
    return { success: false, error: 'Failed to demote user' };
  }
}

/**
 * Gets all admin users
 */
export async function getAllAdmins() {
  try {
    await connect();
    return await User.find({ role: { $in: ['admin', 'super_admin'] } })
      .select('email name role createdAt promotedBy promotedAt')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}

/**
 * Gets admin audit log
 */
export async function getAdminAuditLog(limit: number = 100) {
  try {
    await connect();
    return await AdminAuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }
}

/**
 * Gets pending admin invitations
 */
export async function getPendingInvitations() {
  try {
    await connect();
    return await AdminInvitation.find({
      isUsed: false,
      expiresAt: { $gt: new Date() },
      isActive: true
    })
    .select('email role invitedBy createdAt expiresAt')
    .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return [];
  }
}

/**
 * Revokes an admin invitation
 */
export async function revokeAdminInvitation(
  adminEmail: string, 
  invitationId: string,
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connect();
    
    const revoker = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!revoker || !['admin', 'super_admin'].includes(revoker.role)) {
      return { success: false, error: 'Insufficient permissions to revoke invitations' };
    }
    
    const invitation = await AdminInvitation.findById(invitationId);
    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }
    
    if (invitation.isUsed) {
      return { success: false, error: 'Invitation has already been used' };
    }
    
    invitation.isActive = false;
    invitation.revokedBy = adminEmail;
    invitation.revokedAt = new Date();
    await invitation.save();
    
    await AdminAuditLog.create({
      action: 'INVITATION_REVOKED',
      adminEmail: adminEmail,
      targetEmail: invitation.email,
      role: invitation.role,
      timestamp: new Date(),
      ipAddress: ipAddress,
      details: `Admin invitation revoked for ${invitation.email}`
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return { success: false, error: 'Failed to revoke invitation' };
  }
}

/**
 * Checks if a user has admin permissions
 */
export async function checkAdminPermissions(email: string): Promise<{ isAdmin: boolean; role?: string }> {
  try {
    await connect();
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return { isAdmin: false };
    }
    
    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    return { isAdmin, role: user.role };
    
  } catch (error) {
    console.error('Error checking admin permissions:', error);
    return { isAdmin: false };
  }
}

/**
 * Checks and gets user role including invitation validation
 */
export async function checkAndGetUserRole(email: string): Promise<string> {
  try {
    await connect();
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return existingUser.role;
    }
    
    // Check for valid admin invitation
    const invitation = await AdminInvitation.findOne({ 
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() },
      isActive: true
    });
    
    if (invitation) {
      // Mark invitation as used and log the action
      invitation.isUsed = true;
      invitation.usedAt = new Date();
      await invitation.save();
      
      // Log the invitation usage
      await AdminAuditLog.create({
        action: 'INVITATION_USED',
        targetEmail: email,
        invitedBy: invitation.invitedBy,
        role: invitation.role,
        timestamp: new Date(),
        details: `Admin invitation used for role: ${invitation.role}`
      });
      
      return invitation.role;
    }
    
    // Default role for new users
    return 'user';
    
  } catch (error) {
    console.error('Error checking user role:', error);
    return 'user';
  }
}