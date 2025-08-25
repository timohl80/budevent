# Cloudinary Setup Guide

## Why Cloudinary?
- **Free tier**: 25GB storage, 25GB bandwidth/month
- **Automatic optimization**: Resizes, compresses, converts formats
- **CDN**: Fast global delivery
- **No RLS issues**: Simple API-based uploads

## Setup Steps:

### 1. Create Cloudinary Account
- Go to [cloudinary.com](https://cloudinary.com)
- Sign up for free account
- Get your credentials from Dashboard

### 2. Install Package
```bash
npm install cloudinary
```

### 3. Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Create Cloudinary Service
```typescript
// src/lib/cloudinary-service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  static async uploadImage(file: File, eventId: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('public_id', `event-${eventId}-${Date.now()}`);
    formData.append('folder', 'events');
    
    const response = await fetch('/api/upload-to-cloudinary', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return data.secure_url;
  }
}
```

### 5. Create API Route
```typescript
// src/app/api/upload-to-cloudinary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const publicId = formData.get('public_id') as string;
    const folder = formData.get('folder') as string;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: folder,
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    
    return NextResponse.json({ secure_url: result.secure_url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

## Benefits:
- ✅ **No RLS issues**
- ✅ **Automatic optimization**
- ✅ **Fast CDN delivery**
- ✅ **Reliable storage**
- ✅ **Free tier available**
