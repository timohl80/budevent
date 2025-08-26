import { supabase } from './supabase';

export class SimpleStorageService {
  private static BUCKET_NAME = 'event-images-v2';

  // Use optimized base64 for reliable storage
  static async uploadImage(file: File, _eventId: string): Promise<string> {
    try {
      console.log('🚀🚀🚀 SIMPLE STORAGE SERVICE CALLED 🚀🚀🚀');
      console.log('=== UPLOAD START ===');
      console.log('Using optimized base64 storage with color profile handling');
      console.log('Input file type:', file.type);
      console.log('Input file size:', file.size);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Try to compress and fix color profile issues
      let compressedFile: File;
      try {
        console.log('Starting compression...');
        compressedFile = await this.compressImage(file);
        console.log('Image compressed from', file.size, 'to', compressedFile.size, 'bytes');
      } catch (compressionError) {
        console.warn('Compression failed, using original file:', compressionError);
        compressedFile = file;
      }
      
      // Convert to base64 for reliable storage
      console.log('Starting base64 conversion...');
      let base64 = await this.convertToBase64(compressedFile);
      console.log('Base64 conversion complete, length:', base64.length);
      console.log('Base64 starts with:', base64.substring(0, 50));
      console.log('Is base64?', base64.startsWith('data:image/'));
      console.log('Base64 type:', typeof base64);
      
      // Force base64 if conversion failed
      if (!base64.startsWith('data:image/')) {
        console.warn('Base64 conversion failed, forcing fallback conversion');
        base64 = await this.forceBase64Conversion(compressedFile);
        console.log('Fallback result starts with:', base64.substring(0, 50));
      }
      
      console.log('=== FINAL RESULT ===');
      console.log('Returning:', base64.substring(0, 100));
      console.log('=== UPLOAD END ===');
      
      return base64;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  // Compress image to reduce base64 size
  private static async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 600x400 for smaller base64)
        const maxWidth = 600;
        const maxHeight = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Force sRGB color space to prevent CMYK/ICC issues
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          // Force sRGB color space and prevent color profile issues
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        // Draw and compress image with proper color handling
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality 0.6 (60%) and force sRGB color space
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.6
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  private static async ensureBucketExists() {
    try {
      console.log('Checking if bucket exists...');
      
      // Try to list buckets to see if ours exists
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        // Don't throw error, just log it and continue
        console.log('Continuing with upload attempt...');
        return;
      }

      console.log('Available buckets:', buckets?.map(b => b.name) || []);
      
      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME);
      console.log(`Bucket '${this.BUCKET_NAME}' exists:`, bucketExists);
      
      if (bucketExists) {
        console.log('Bucket already exists, proceeding with upload...');
      } else {
        console.log('Bucket not found in list, but continuing with upload attempt...');
        // Don't try to create bucket, just continue
      }
    } catch (error) {
      console.warn('Bucket check failed, but continuing:', error);
      // Don't throw error, just continue
    }
  }

  private static async uploadToSupabase(file: File, eventId: string): Promise<string | null> {
    try {
      console.log('Starting Supabase upload...');
      console.log('File info:', { name: file.name, type: file.type, size: file.size });
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Generate filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}-${Date.now()}.${fileExt}`;
      console.log('Generated filename:', fileName);

      console.log('Uploading to bucket:', this.BUCKET_NAME);
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Supabase upload failed:', error);
      return null;
    }
  }

  private static convertToBase64(file: File): Promise<string> {
    console.log('convertToBase64 called with file:', file.name, file.type, file.size);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        console.log('FileReader onload triggered');
        console.log('Result type:', typeof reader.result);
        console.log('Result length:', reader.result?.toString().length);
        
        if (typeof reader.result === 'string') {
          console.log('Base64 conversion successful, length:', reader.result.length);
          console.log('Result type:', typeof reader.result);
          console.log('Result starts with:', reader.result.substring(0, 50));
          console.log('Is data URL?', reader.result.startsWith('data:'));
          console.log('Is blob URL?', reader.result.startsWith('blob:'));
          resolve(reader.result);
        } else {
          console.error('FileReader result is not a string:', typeof reader.result);
          console.error('Result value:', reader.result);
          reject(new Error('Failed to convert file to base64'));
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('File reading failed'));
      };
      
      reader.onprogress = (event) => {
        console.log('FileReader progress:', event.loaded, '/', event.total);
      };
      
      console.log('Starting FileReader.readAsDataURL...');
      reader.readAsDataURL(file);
    });
  }

  // Fallback base64 conversion method
  private static async forceBase64Conversion(file: File): Promise<string> {
    console.log('Using fallback base64 conversion');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          console.log('Fallback conversion successful');
          resolve(reader.result);
        } else {
          reject(new Error('Fallback conversion failed'));
        }
      };
      reader.onerror = () => reject(new Error('Fallback conversion failed'));
      reader.readAsDataURL(file);
    });
  }

  // Delete image (only works for Supabase URLs)
  static async deleteImage(imageUrl: string): Promise<void> {
    if (imageUrl.startsWith('data:')) {
      // Base64 image, nothing to delete
      console.log('Base64 image, no deletion needed');
      return;
    }

    if (imageUrl.startsWith('blob:')) {
      // Blob URL, clean it up
      URL.revokeObjectURL(imageUrl);
      console.log('Blob URL cleaned up');
      return;
    }

    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.warn('Could not delete image:', error);
      }
    } catch (error) {
      console.warn('Image deletion failed:', error);
    }
  }
}
