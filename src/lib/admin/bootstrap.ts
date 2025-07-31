// lib/admin/bootstrap.ts - Clean implementation for Option 1 only

import { connect } from "../dbconfigue/dbConfigue";
import { User } from "../../app/models/auth/authModel";
import { AdminAuditLog } from "../../app/models/auth/adminModels";

/**
 * Environment Variable Bootstrap
 * Create first super admin from environment variables on app startup
 */
export async function bootstrapSuperAdmin(): Promise<void> {
  try {
    await connect();
    
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';
    
    if (!superAdminEmail) {
      console.log('No SUPER_ADMIN_EMAIL found in environment variables');
      return;
    }
    
    // Check if any super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }
    
    // Check if the user already exists
    let user = await User.findOne({ email: superAdminEmail.toLowerCase() });
    
    if (user) {
      // Promote existing user to super admin
      user.role = 'super_admin';
      user.promotedBy = 'system';
      user.promotedAt = new Date();
      await user.save();
      
      console.log(`Existing user ${superAdminEmail} promoted to super admin`);
    } else {
      // Create new super admin user
      user = await User.create({
        email: superAdminEmail.toLowerCase(),
        name: superAdminName,
        role: 'super_admin',
        provider: 'credentials',
        isActive: true,
        promotedBy: 'system',
        promotedAt: new Date()
      });
      
      console.log(`New super admin created: ${superAdminEmail}`);
    }
    
    // Log the bootstrap action
    await AdminAuditLog.create({
      action: 'USER_PROMOTED',
      adminEmail: 'system',
      targetEmail: superAdminEmail,
      role: 'super_admin',
      timestamp: new Date(),
      details: 'Super admin bootstrapped from environment variables'
    });
    
  } catch (error) {
    console.error('Error bootstrapping super admin:', error);
  }
}

/**
 * Verify super admin exists and is properly configured
 */
export async function verifySuperAdminExists(): Promise<boolean> {
  try {
    await connect();
    
    const superAdminCount = await User.countDocuments({ role: 'super_admin' });
    
    if (superAdminCount === 0) {
      console.warn('⚠️  No super admin found in the system!');
      console.warn('   Set SUPER_ADMIN_EMAIL in your environment variables and restart the application.');
      return false;
    }
    return true;
    
  } catch (error) {
    console.error('Error verifying super admin:', error);
    return false;
  }
}


