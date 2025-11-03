import React, { useState, useRef } from 'react';
import { OriginalImage } from '../types';

interface ImageInputProps {
  onImageUpload: (image: OriginalImage) => void;
}

const fileToBase64 = (file: File): Promise<OriginalImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimePart, dataPart] = result.split(',');
      if (!mimePart || !dataPart) {
          reject(new Error("Invalid file format"));
          return;
      }
      const mimeType = mimePart.split(':')[1]?.split(';')[0];
       if (!mimeType) {
          reject(new Error("Could not determine mime type"));
          return;
      }
      resolve({ base64Data: dataPart, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

const ImageInput: React.FC<ImageInputProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido.');
        setPreview(null);
        return;
      }
      setError(null);
      setPreview(URL.createObjectURL(file));
      try {
        const image = await fileToBase64(file);
        onImageUpload(image);
      } catch (err) {
        setError('Error al leer el archivo de imagen.');
        console.error(err);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[#f3c6ca] mb-2">
        Subir Logo
      </label>
      <div
        onClick={handleClick}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#d12863] border-dashed rounded-md cursor-pointer hover:border-[#fc4986] transition-colors"
      >
        <div className="space-y-1 text-center">
          {preview ? (
            <img src={preview} alt="Vista previa del logo" className="mx-auto h-24 w-auto rounded-md" />
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-[#f3c6ca]/70"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <div className="flex text-sm text-[#f3c6ca]/70 justify-center">
            <p className="pl-1">{preview ? 'Haz clic para cambiar el logo' : 'Haz clic para subir un logo'}</p>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-[#f3c6ca]/60">PNG, JPG, GIF hasta 10MB</p>
        </div>
      </div>
       {error && <p className="mt-2 text-sm text-[#fc4986]">{error}</p>}
    </div>
  );
};

export default ImageInput;