"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/lib/api/client";

interface PropertyImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
}

export function PropertyImageUpload({ 
  onImagesUploaded, 
  existingImages = [], 
  maxImages = 10 
}: PropertyImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiClient.post('/api/properties/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.images) {
        const urls = response.images.map((img: any) => img.url);
        const newImages = [...images, ...urls];
        setImages(newImages);
        onImagesUploaded(newImages);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = '';
    }
  }, [images, maxImages, onImagesUploaded]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  }, [images, onImagesUploaded]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square relative rounded-lg overflow-hidden border border-estate-border">
              <Image
                src={url}
                alt={`Property image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <div className="aspect-square rounded-lg border-2 border-dashed border-estate-border flex flex-col items-center justify-center hover:border-estate-navy transition bg-gray-50">
              {uploading ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-estate-navy animate-spin mx-auto" />
                  <span className="text-xs text-estate-muted mt-2 block">
                    Uploading... {uploadProgress}%
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-estate-muted" />
                  <span className="text-xs text-estate-muted mt-2">
                    Upload Images
                  </span>
                  <span className="text-xs text-estate-muted">
                    ({images.length}/{maxImages})
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {images.length > 0 && (
        <p className="text-xs text-estate-muted">
          {images.length} image(s) uploaded
        </p>
      )}
    </div>
  );
}