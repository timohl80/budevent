import { supabase } from './supabase';

export class StorageService {
  private static BUCKET_NAME = 'event-images';

  // Initialize storage bucket if it doesn't exist
  static async initializeBucket() {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        return;
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5242880, // 5MB
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
        } else {
          console.log('Storage bucket created successfully');
        }
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  // Upload an image file
  static async uploadImage(file: File, eventId: string): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Storage service error:', error);
      throw error;
    }
  }

  // Delete an image
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.error('Error deleting image:', error);
        throw new Error('Failed to delete image');
      }

      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Storage service error:', error);
      throw error;
    }
  }

  // Get all images for an event
  static async getEventImages(eventId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          search: eventId
        });

      if (error) {
        console.error('Error listing images:', error);
        return [];
      }

      return data
        .filter(item => item.name.startsWith(eventId))
        .map(item => {
          const { data: urlData } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(item.name);
          return urlData.publicUrl;
        });
    } catch (error) {
      console.error('Storage service error:', error);
      return [];
    }
  }
}
