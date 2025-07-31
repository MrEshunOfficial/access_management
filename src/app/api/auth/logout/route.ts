// File: app/api/auth/logout/route.ts
// Add this to your authentication service

import { NextResponse } from 'next/server';
import { doLogout } from '@/app/actions'; // Your existing server action

export async function POST() {
  try {
    // Call your existing logout server action
    await doLogout();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully' 
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Logout API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Logout failed' 
      }, 
      { status: 500 }
    );
  }
}