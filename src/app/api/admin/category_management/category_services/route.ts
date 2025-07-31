// src/app/api/services/route.ts
import { connect } from '@/lib/dbconfigue/dbConfigue';
import { ServiceService } from '@/lib/admin/services/serviceServices';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// GET /api/services - Get all services with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connect();
   
    const searchParams = request.nextUrl.searchParams;
   
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as 'title' | 'popular' | 'createdAt') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      ...(searchParams.has('isActive') && {
        isActive: searchParams.get('isActive') === 'true'
      }),
      ...(searchParams.has('popular') && {
        popular: searchParams.get('popular') === 'true'
      }),
      tags: searchParams.get('tags')?.split(',') || undefined,
      includeCategory: searchParams.get('includeCategory') === 'true'
    };
    
    const result = await ServiceService.getServices(options);
   
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Services retrieved successfully'
    });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get services'
    }, { status: 500 });
  }
}

// Helper function to save uploaded file
async function saveUploadedFile(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${originalName}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'services');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }

    // Save file
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);
    
    // Return public URL - changed from /api/services/ to /uploads/services/
    return `/api/services/${filename}`;
  } catch (error) {
    console.error('File save error:', error);
    throw new Error('Failed to save uploaded file');
  }
}

// POST /api/services - Create a new service (handles both JSON and FormData)
export async function POST(request: NextRequest) {
  try {
    await connect();

    const contentType = request.headers.get('content-type') || '';
    interface ServiceBody {
      title: string;
      description: string;
      categoryId: string;
      [key: string]: unknown;
    }
    let body: ServiceBody;
    let uploadedImageUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('image') as File;
      
      if (!file) {
        return NextResponse.json({
          success: false,
          error: 'No image file provided'
        }, { status: 400 });
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid file type. Only images are allowed.'
        }, { status: 400 });
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          error: 'File size too large. Maximum 5MB allowed.'
        }, { status: 400 });
      }

      try {
        // Save the file and get the URL
        uploadedImageUrl = await saveUploadedFile(file);
        
        return NextResponse.json({
          success: true,
          data: {
            url: uploadedImageUrl,
            filename: file.name
          },
          message: 'Image uploaded successfully'
        });
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Failed to upload image'
        }, { status: 500 });
      }
    } else {
      // Handle regular JSON service creation
     try {
  body = await request.json();
} catch (error) {
  console.error('JSON parsing error:', error); // log the error
  return NextResponse.json({
    success: false,
    error: 'Invalid JSON data'
  }, { status: 400 });
}


      // Validate required fields
      if (!body.title || typeof body.title !== 'string') {
        return NextResponse.json({
          success: false,
          error: 'title is required and must be a string'
        }, { status: 400 });
      }
     
      if (!body.description || typeof body.description !== 'string') {
        return NextResponse.json({
          success: false,
          error: 'description is required and must be a string'
        }, { status: 400 });
      }
     
      if (!body.categoryId || typeof body.categoryId !== 'string') {
        return NextResponse.json({
          success: false,
          error: 'categoryId is required and must be a string'
        }, { status: 400 });
      }

      // Convert categoryId to ObjectId
      const { ObjectId } = await import('mongodb');
      const serviceInput = {
        ...body,
        categoryId: new ObjectId(body.categoryId)
      };

      const service = await ServiceService.createService(serviceInput);
     
      return NextResponse.json({
        success: true,
        data: service,
        message: 'Service created successfully'
      }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/services error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process request'
    }, { status: 500 });
  }
}