import React from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
interface ServicesPanelProps {
  serviceName: string;
  setServiceName: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  servicePhoto: string;
  setServicePhoto: React.Dispatch<React.SetStateAction<string>>;
  setUploadPhotoData: React.Dispatch<React.SetStateAction<any>>;
}
const ServicesPanel: React.FC<ServicesPanelProps> = ({
  serviceName,
  setServiceName,
  description,
  setDescription,
  servicePhoto,
  setServicePhoto,
  setUploadPhotoData
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setServicePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadPhotoData(file);
    }
  };
  return (
    <div className="">
      {/* Service Name */}
      <div className="mb-8">
        <div>
          <p className="mb-2 ">Service Name</p>
          <Input
            type="text"
            value={serviceName || ''}
            onChange={(e) => setServiceName(e.target.value)}
          />
        </div>
      </div>
      {/* Description */}
      <div className="mb-8">
        <div>
          <p className="">Description</p>
          <p className="mb-2 text-sm text-muted-foreground">
            This will appear on confirmation email for this service
          </p>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      {/* Upload */}
      <div className="mb-8">
        <div>
          <p className="">Upload</p>
          <p className="mb-2 text-sm text-muted-foreground">
            Add image or logo to be displayed on confirmation email
          </p>
          <div className="group relative mb-4 h-32 w-48 rounded-lg border-2">
            {/* Display the servicePhoto image */}
            {servicePhoto ? (
              <Image
                width={200}
                height={200}
                src={servicePhoto}
                alt="Uploaded Image"
                className="absolute inset-0 h-full w-full rounded-lg object-cover"
              />
            ) : (
              <Image
                src="/placeholder-img.png"
                alt=""
                width={200}
                height={200}
                className="absolute inset-0 h-full w-full rounded-lg object-cover"
              />
            )}
            <Input
              type="file"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ServicesPanel;
