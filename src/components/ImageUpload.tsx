'use client';

import { useState, useRef, useCallback } from 'react';
import { SimpleStorageService } from '@/lib/simple-storage-service';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string;
  eventId?: string; // For generating unique filenames
  className?: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  onImageRemoved, 
  currentImageUrl, 
  eventId,
  className = '' 
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!eventId) {
      setError('Please wait while preparing image upload...');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const imageUrl = await SimpleStorageService.uploadImage(file, eventId);
      
      console.log('Upload completed, image URL length:', imageUrl.length);
      console.log('Image URL preview:', imageUrl.substring(0, 100) + '...');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onImageUploaded(imageUrl);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      try {
        await SimpleStorageService.deleteImage(currentImageUrl);
        onImageRemoved?.();
      } catch (error) {
        setError('Failed to remove image');
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {currentImageUrl && (
        <div className="relative">
          <img 
            src={currentImageUrl} 
            alt="Event image" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!currentImageUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-[#A29BFE] bg-[#A29BFE] bg-opacity-5' 
              : 'border-gray-300 hover:border-[#A29BFE]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!eventId ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#A29BFE]"></div>
              </div>
              <p className="text-[#2D3436] font-medium">Preparing image upload...</p>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#A29BFE]"></div>
              </div>
              <div className="space-y-2">
                <p className="text-[#2D3436] font-medium">Uploading image...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#A29BFE] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-[#2D3436] opacity-70">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-[#2D3436]">
                  Drop your image here, or{' '}
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="text-[#A29BFE] hover:text-[#8B7FD8] underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-[#2D3436] opacity-70">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
