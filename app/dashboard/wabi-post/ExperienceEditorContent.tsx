import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Carousel from './Carousel';

import ExperienceField from './Experience/ExperienceField';
interface ExperienceEditorContentProps {
  contentDescription: string;
  contentTitle: string;
  experienceBookingFee: number;
  experienceDayOfWeek: number[];
  experienceEndDate: Date | null;
  experienceFlatRate: number;
  experienceFloor: number | null;
  experienceRecurringType: number;
  experienceRecurringValue: number;
  experienceStartDate: Date | null;
  experienceUntilTime: number;
  experienceWidgetServiceIds: number[];
  handleClose: () => void;
  handleDeleteModalOpen: () => void;
  handleDeletePhoto: (id: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  imagePreview: any;
  isActive: boolean;
  isOpen: boolean;
  isReccuring: boolean;
  selectedContent: any;
  setContentDescription: React.Dispatch<React.SetStateAction<string>>;
  setContentTitle: React.Dispatch<React.SetStateAction<string>>;
  setExperienceBookingFee: React.Dispatch<React.SetStateAction<number>>;
  setExperienceDayOfWeek: React.Dispatch<React.SetStateAction<number[]>>;
  setExperienceEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setExperienceFlatRate: React.Dispatch<React.SetStateAction<number>>;
  setExperienceFloor: React.Dispatch<React.SetStateAction<number | null>>;
  setExperienceRecurringType: React.Dispatch<React.SetStateAction<number>>;
  setExperienceRecurringValue: React.Dispatch<React.SetStateAction<number>>;
  setExperienceStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setExperienceUntilTime: React.Dispatch<React.SetStateAction<number>>;
  setExperienceWidgetServiceIds: React.Dispatch<React.SetStateAction<number[]>>;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReccuring: React.Dispatch<React.SetStateAction<boolean>>;
  setTicketLimit: React.Dispatch<React.SetStateAction<number>>;
  setTicketPrice: React.Dispatch<React.SetStateAction<number>>;
  ticketLimit: number;
  ticketPrice: number;
}
const ExperienceEditorContent: React.FC<ExperienceEditorContentProps> = ({
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
  handleSave,
  handleDeleteModalOpen,
  handleClose,
  ticketLimit,
  setTicketLimit,
  ticketPrice,
  setTicketPrice,
  experienceStartDate,
  setExperienceStartDate,
  experienceEndDate,
  setExperienceEndDate,
  experienceBookingFee,
  setExperienceBookingFee,
  experienceFlatRate,
  setExperienceFlatRate,
  experienceUntilTime,
  setExperienceUntilTime,
  isReccuring,
  setIsReccuring,
  experienceRecurringType,
  setExperienceRecurringType,
  experienceRecurringValue,
  setExperienceRecurringValue,
  experienceDayOfWeek,
  setExperienceDayOfWeek,
  experienceFloor,
  setExperienceFloor,
  experienceWidgetServiceIds,
  setExperienceWidgetServiceIds,
  isOpen
}) => {
  return (
    <div>
      <div className="fixed left-2 top-2 mb-4 flex w-full items-center gap-2 md:static">
        <Button variant={'ghost'} onClick={handleClose} className="p-1">
          <X className="h-6 w-6" />
        </Button>
        <h2 className="text-lg font-bold md:text-2xl">
          {selectedContent ? 'Edit' : 'Add'} Experience
        </h2>
      </div>
      <div className="gap-12 pt-6 md:pt-0 xl:flex">
        <div className="mb-4 w-full xl:w-1/3">
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
                          <Label
                            key={image.id}
                            htmlFor={`file-input-${image.id}`}
                          >
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
                        <Label
                          htmlFor="new-file-input"
                          className="cursor-pointer"
                        >
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
              <div className="mb-4">
                <Label className="flex items-center justify-between">
                  <p>Is Active</p>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => setIsActive(!isActive)}
                  />
                </Label>
              </div>
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
                    id="Description"
                    className="mb-4 w-full"
                    placeholder="Enter..."
                    value={contentDescription || ''}
                    onChange={(e) => setContentDescription(e.target.value)}
                    rows={5}
                  />
                </Label>
              </div>
              <div className="mb-4 flex gap-4"></div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full xl:w-2/3">
          <div className="overflow-y-auto" style={{ height: '72dvh' }}>
            <ExperienceField
              isOpen={isOpen}
              ticketLimit={ticketLimit}
              setTicketLimit={setTicketLimit}
              ticketPrice={ticketPrice}
              setTicketPrice={setTicketPrice}
              experienceStartDate={experienceStartDate}
              setExperienceStartDate={setExperienceStartDate}
              experienceEndDate={experienceEndDate}
              setExperienceEndDate={setExperienceEndDate}
              experienceBookingFee={experienceBookingFee}
              setExperienceBookingFee={setExperienceBookingFee}
              experienceFlatRate={experienceFlatRate}
              setExperienceFlatRate={setExperienceFlatRate}
              experienceUntilTime={experienceUntilTime}
              setExperienceUntilTime={setExperienceUntilTime}
              isReccuring={isReccuring}
              setIsReccuring={setIsReccuring}
              experienceRecurringType={experienceRecurringType}
              setExperienceRecurringType={setExperienceRecurringType}
              experienceRecurringValue={experienceRecurringValue}
              setExperienceRecurringValue={setExperienceRecurringValue}
              experienceDayOfWeek={experienceDayOfWeek}
              setExperienceDayOfWeek={setExperienceDayOfWeek}
              experienceFloor={experienceFloor}
              setExperienceFloor={setExperienceFloor}
              experienceWidgetServiceIds={experienceWidgetServiceIds}
              setExperienceWidgetServiceIds={setExperienceWidgetServiceIds}
            />
          </div>
          <div className="mt-8 flex  items-center justify-between gap-8">
            <Button
              variant={'danger'}
              onClick={() => handleDeleteModalOpen()}
              className=" flex w-full items-center gap-2"
            >
              <Trash size={16} />
              Delete
            </Button>
            <Button className="w-full " onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceEditorContent;
