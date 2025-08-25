# AWS S3 Setup Guide

## Why AWS S3?
- **Very reliable**: Industry standard
- **Cost-effective**: $0.023 per GB/month
- **No RLS issues**: Simple bucket policies
- **Global availability**: Multiple regions

## Setup Steps:

### 1. Create AWS Account
- Go to [aws.amazon.com](https://aws.amazon.com)
- Create free tier account
- Get your access keys

### 2. Install Package
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3. Environment Variables
Add to `.env.local`:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 4. Create S3 Service
```typescript
// src/lib/s3-service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class S3Service {
  static async uploadImage(file: File, eventId: string): Promise<string> {
    const key = `events/${eventId}-${Date.now()}-${file.name}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read',
    });
    
    await s3Client.send(command);
    
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
```

### 5. Create API Route
```typescript
// src/app/api/upload-to-s3/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    
    const url = await S3Service.uploadImage(file, eventId);
    
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

## Benefits:
- ✅ **Very reliable**
- ✅ **No RLS issues**
- ✅ **Cost-effective**
- ✅ **Global CDN available**
- ✅ **Industry standard**
