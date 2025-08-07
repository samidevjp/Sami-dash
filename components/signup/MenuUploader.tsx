import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MenuUploaderProps {
  setLoading: (loading: boolean) => void;
  onFileSelect: (file: File) => void;
}

export default function MenuUploader({
  setLoading,
  onFileSelect
}: MenuUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      setSelectedFile(
        file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      );
      onFileSelect(file);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-lg border p-4 shadow-md">
      <Button
        type="button"
        className="mb-4"
        onClick={(e) => document.getElementById('menu-upload-input')?.click()}
      >
        Upload Menu Image or PDF
      </Button>
      <input
        id="menu-upload-input"
        type="file"
        // accept=".pdf,.csv,image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      {selectedFile && (
        <div className="mb-4 w-full">
          <img
            src={selectedFile}
            className="h-[200px] w-full rounded-lg border object-contain p-2"
            alt="Selected Menu"
          />
        </div>
      )}
    </div>
  );
}
