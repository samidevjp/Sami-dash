// components/EditorContent/TicketEditorContent.tsx

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import TicketsField from './Tickets/TicketsField';
import { Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketFieldProps } from './types';
import Carousel from './Carousel';

interface TicketEditorContentProps extends TicketFieldProps {
  isActive: boolean;
  imagePreview: any;
  setIsActive: (val: boolean) => void;
  contentTitle: string;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeletePhoto: (id: number) => void;
  setContentTitle: (val: string) => void;
  contentDescription: string;
  setContentDescription: (val: string) => void;
  handleSave: () => void;
  handleDeleteModalOpen: () => void;
  isSaving: boolean;
  selectedContent: any;
  handleClose: () => void;
}

const TicketEditorContent: React.FC<TicketEditorContentProps> = ({
  isActive,
  imagePreview,
  setIsActive,
  handleDeletePhoto,
  contentTitle,
  setContentTitle,
  handleImageUpload,
  contentDescription,
  setContentDescription,
  totalTickets,
  setTotalTickets,
  startSellDate,
  setStartSellDate,
  endSellDate,
  setEndSellDate,
  eventDate,
  setEventDate,
  expirationDate,
  setExpirationDate,
  ticketOptions,
  setTicketOptions,
  handleSave,
  handleDeleteModalOpen,
  isSaving,
  handleClose,
  selectedContent
}) => {
  return (
    <div>
      <div className="fixed left-2 top-2 mb-4 flex w-full items-center gap-2 md:static">
        <Button variant={'ghost'} onClick={handleClose} className="p-1">
          <X className="h-6 w-6" />
        </Button>
        <h2 className="text-lg font-bold md:text-2xl">
          {selectedContent ? 'Edit' : 'Add'} Tickets
        </h2>
      </div>
      <div>
        <div className="gap-12 pt-8 md:pt-0 xl:flex">
          <div className={`mb-4 w-full xl:w-1/3`}>
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
                      <Label
                        htmlFor="new-file-input"
                        className="cursor-pointer"
                      >
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
              </CardContent>
            </Card>
          </div>
          <div className="w-full xl:w-2/3">
            <div className="overflow-y-auto" style={{ height: '88dvh' }}>
              <Card className="border-none bg-secondary">
                <CardContent>
                  <TicketsField
                    totalTickets={totalTickets}
                    setTotalTickets={setTotalTickets}
                    startSellDate={startSellDate}
                    setStartSellDate={setStartSellDate}
                    endSellDate={endSellDate}
                    setEndSellDate={setEndSellDate}
                    eventDate={eventDate}
                    setEventDate={setEventDate}
                    expirationDate={expirationDate}
                    setExpirationDate={setExpirationDate}
                    ticketOptions={ticketOptions}
                    setTicketOptions={setTicketOptions}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="fixed right-2 top-2 flex items-center justify-between gap-2  md:absolute md:right-6 md:top-6 md:gap-4">
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
  );
};

export default TicketEditorContent;
