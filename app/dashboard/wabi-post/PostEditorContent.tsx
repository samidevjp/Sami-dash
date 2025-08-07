// components/EditorContent/PostEditorContent.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Trash } from 'lucide-react';
import Carousel from './Carousel';

interface PostEditorContentProps {
  selectedContent: any;
  imagePreview: any;
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeletePhoto: (id: number) => void;
  contentTitle: string;
  setContentTitle: (val: string) => void;
  contentDescription: string;
  setContentDescription: (val: string) => void;
  isCanBook: boolean;
  setIsCanBook: (val: boolean) => void;
  isSetDateTime: boolean;
  setIsSetDateTime: (val: boolean) => void;
  bookingDate: string | null;
  setBookingDate: (val: string) => void;
  bookingTime: number | null;
  setBookingTime: (val: number) => void;
  handleDeleteModalOpen: () => void;
  handleSave: () => void;
  isSaving: boolean;
  handleClose: () => void;
}

const PostEditorContent: React.FC<PostEditorContentProps> = ({
  selectedContent,
  imagePreview,
  isActive,
  setIsActive,
  handleImageUpload,
  handleDeletePhoto,
  contentTitle,
  setContentTitle,
  contentDescription,
  setContentDescription,
  isCanBook,
  setIsCanBook,
  isSetDateTime,
  setIsSetDateTime,
  bookingDate,
  setBookingDate,
  bookingTime,
  setBookingTime,
  handleDeleteModalOpen,
  handleSave,
  isSaving,
  handleClose
}) => {
  return (
    <div>
      <div className="fixed left-2 top-2 mb-4 flex w-full items-center gap-2 md:static">
        <Button variant="ghost" onClick={handleClose} className="p-1">
          <X className="h-6 w-6" />
        </Button>
        <h2 className="text-lg font-bold md:text-2xl">
          {selectedContent ? 'Edit' : 'Add'} Post
        </h2>
      </div>
      <Card className="border-none bg-secondary">
        <CardHeader>
          <div className="relative mb-4 flex h-52 w-full items-center justify-center overflow-hidden rounded-lg bg-secondary">
            <Carousel imagePreview={imagePreview} />
          </div>
          <div className="mb-2">
            <div className="flex flex-wrap items-center gap-2">
              {imagePreview.length > 0 ? (
                <>
                  {imagePreview
                    .filter((image: any) => !image.is_deleted)
                    .map((image: any) => (
                      <Label key={image.id} htmlFor={`file-input-${image.id}`}>
                        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-gray-500">
                          <button
                            className="absolute right-0 top-0 text-white"
                            onClick={() => {
                              handleDeletePhoto(image.id);
                            }}
                          >
                            <X size={16} />
                          </button>
                          <img
                            src={`${image.path}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Label>
                    ))}
                  {imagePreview.filter((image: any) => !image.is_deleted)
                    .length < 5 && (
                    <Label htmlFor="new-file-input" className="cursor-pointer">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-400 text-white">
                        <span className="text-lg">+</span>
                      </div>
                      <Input
                        id="new-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                        className="hidden"
                      />
                    </Label>
                  )}
                </>
              ) : (
                <Label htmlFor="new-file-input" className="cursor-pointer">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-400 text-white">
                    <span className="text-xl font-bold">+</span>
                  </div>
                  <Input
                    id="new-file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                    className="hidden"
                  />
                </Label>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Label className="mb-4 flex items-center justify-between">
            <p>Is Active</p>
            <Switch
              checked={isActive}
              onCheckedChange={() => setIsActive(!isActive)}
            />
          </Label>
          <div className="mb-4">
            <Label>
              <p className="mb-2">Name</p>
              <Input
                placeholder="Enter Name"
                value={contentTitle || ''}
                onChange={(e) => setContentTitle(e.target.value)}
              />
            </Label>
          </div>
          <div className="mb-4">
            <Label>
              <p className="mb-2">Description</p>
              <Textarea
                placeholder="Enter..."
                value={contentDescription || ''}
                onChange={(e) => setContentDescription(e.target.value)}
              />
            </Label>
          </div>
          <Label className="flex items-center justify-between">
            <p>Include &quot;Book Now&quot; button?</p>
            <Switch
              checked={isCanBook}
              onCheckedChange={() => setIsCanBook(!isCanBook)}
            />
          </Label>
          {isCanBook && (
            <div className="mt-4">
              <Label className="flex items-center justify-between">
                <p>Set default booking date & time?</p>
                <Switch
                  checked={isSetDateTime}
                  onCheckedChange={() => setIsSetDateTime(!isSetDateTime)}
                />
              </Label>
              <div
                className={`mt-4 grid grid-cols-2 space-x-4 ${
                  !isSetDateTime ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <div>
                  <Label htmlFor="booking-date">Booking Date</Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={bookingDate || ''}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="booking-time">Booking Time</Label>
                  <Input
                    id="booking-time"
                    type="time"
                    value={
                      bookingTime
                        ? new Date(bookingTime * 1000)
                            .toISOString()
                            .substr(11, 5)
                        : ''
                    }
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      setBookingTime(h * 3600 + m * 60);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-8 flex items-center justify-between gap-8">
        <Button
          variant="danger"
          onClick={handleDeleteModalOpen}
          className="w-full"
        >
          <Trash size={16} /> Delete
        </Button>
        <Button onClick={handleSave} className="w-full" disabled={isSaving}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default PostEditorContent;
