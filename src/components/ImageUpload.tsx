'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  userId: string;
  onImageUpload: (base64: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ImageUpload({ currentImage, userId, onImageUpload, size = 'md' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
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

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const resizeImage = async (base64: string, maxSize: number = 500): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = base64;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    console.log('Processing image:', file.name, file.size);
    setUploading(true);
    setProcessing(true);

    try {
      const base64 = await fileToBase64(file);
      console.log('Converting to optimized Base64...');
      
      const optimizedBase64 = await resizeImage(base64, 400);
      console.log('Base64 generated, length:', optimizedBase64.length);
      
      setPreview(optimizedBase64);
      onImageUpload(optimizedBase64);
      console.log('Image upload successful!');
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    } finally {
      setUploading(false);
      setProcessing(false);
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
        disabled={uploading}
      />

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-rose-400/60 cursor-pointer hover:border-rose-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-600 to-crimson-700 flex items-center justify-center">
            <Camera className={`${iconSizes[size]} text-white`} />
          </div>
        )}
      </motion.div>

      {(uploading || processing) && (
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-black/70 flex items-center justify-center backdrop-blur-sm`}>
          <div className="text-center">
            <Loader2 className={`${iconSizes[size]} text-white animate-spin mx-auto mb-1`} />
            <p className="text-white text-xs">Processing...</p>
          </div>
        </div>
      )}

      {!uploading && preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
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