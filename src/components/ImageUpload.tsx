'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Loader2, Check } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ImageUploadProps {
  currentImage?: string;
  userId: string;
  onImageUpload: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ImageUpload({ currentImage, userId, onImageUpload, size = 'md' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 500;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const timestamp = Date.now();
      const fileRef = ref(storage, `profilePictures/${userId}/${timestamp}.jpg`);

      await uploadBytes(fileRef, compressedBlob);
      const downloadUrl = await getDownloadURL(fileRef);

      setPreview(downloadUrl);
      onImageUpload(downloadUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white/20 cursor-pointer hover:border-primary hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-colors`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <Camera className={`${iconSizes[size]} text-white`} />
          </div>
        )}
      </div>

      {uploading && (
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black/60 flex items-center justify-center`}>
          <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
        </div>
      )}

      {!uploading && preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {!uploading && !preview && (
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className={`${iconSizes[size]} text-white`} />
        </div>
      )}
    </div>
  );
}
