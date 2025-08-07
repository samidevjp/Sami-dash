'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { FileIcon } from 'lucide-react';
import { resizeImage } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const ImageUploader = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [isResizing, setIsResizing] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    props.setLoading(true);

    // Store the file name and type
    setFileName(file.name);
    setFileType(file.type);

    let processedFile = file;

    // Only process images, not PDFs
    if (file.type.startsWith('image/')) {
      // Check if file size is too large (over 1MB)
      if (file.size > 1 * 1024 * 1024) {
        try {
          setIsResizing(true);
          // Resize the image to max 1MB and 1200px width
          processedFile = await resizeImage(file, 1, 1200);
          setIsResizing(false);
        } catch (error) {
          console.error('Error resizing image:', error);
          toast({
            title: 'Error',
            description: 'Failed to resize image. Please try a smaller file.',
            variant: 'destructive'
          });
          props.setLoading(false);
          setIsResizing(false);
          return;
        }
      }

      // Create object URL for preview
      setSelectedFile(URL.createObjectURL(processedFile));
    } else {
      setSelectedFile(null); // Clear any previous image
    }

    props.setFile(() => processedFile);

    if (file.type === 'application/pdf') {
      readPdfWithGemini(processedFile);
    } else if (file.type.startsWith('image/')) {
      readImageWithGemini(processedFile);
    }
  };

  const readImageWithGemini = async (image) => {
    try {
      // Create a FormData object to send the image
      const formData = new FormData();
      formData.append('file', image);

      // Send to our server-side API route
      const response = await axios.post('/api/gemini/image-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const text = response.data.text;
      setRecognizedText(text);
      props.setImageUrl(text); // Pass the recognized text back to the parent component
    } catch (error) {
      console.error('Error with Gemini API', error);
      toast({
        title: 'Error',
        description: 'Failed to process image. Please try again.',
        variant: 'destructive'
      });
      props.setLoading(false);
    }
  };

  const readPdfWithGemini = async (pdf) => {
    try {
      // Create a FormData object to send the PDF
      const formData = new FormData();
      formData.append('file', pdf);

      // Send to our server-side API route
      const response = await axios.post('/api/gemini/pdf-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const extractedText = response.data.text;
      setRecognizedText(extractedText);
      props.setImageUrl(extractedText);
      props.setLoading(false);
    } catch (error) {
      console.error('Error processing PDF with Gemini API', error);
      toast({
        title: 'Error',
        description: 'Failed to process PDF. Please try again.',
        variant: 'destructive'
      });
      props.setLoading(false);
    }
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-lg border p-4 shadow-md">
      <Button
        className="mb-4"
        onClick={() => document.getElementById('file-upload-input').click()}
        disabled={isResizing}
      >
        {isResizing ? 'Resizing Image...' : 'Upload Image or PDF'}
      </Button>
      <input
        id="file-upload-input"
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {(selectedFile || fileName) && (
        <div className="mb-4 w-full">
          {fileType === 'application/pdf' ? (
            <div className="flex items-center justify-center rounded-lg border p-4">
              <FileIcon className="mr-2 h-10 w-10 text-red-500" />
              <div>
                <p className="font-medium">PDF uploaded</p>
                <p className="text-sm text-gray-500">{fileName}</p>
              </div>
            </div>
          ) : (
            <img
              src={selectedFile}
              className="h-[90%] w-full rounded-lg border object-contain p-2"
              alt="Selected"
            />
          )}
        </div>
      )}
      {/* {recognizedText && (
        <div className="w-full p-2 bg-gray-100 rounded-lg shadow-inner">
          <h2 className="text-lg font-semibold">Recognized Text:</h2>
          <p className="text-sm">{recognizedText}</p>
        </div>
      )} */}
    </div>
  );
};

export default ImageUploader;
