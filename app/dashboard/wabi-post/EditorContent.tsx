import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Carousel from './Carousel';
import { useApi } from '@/hooks/useApi';
import moment from 'moment';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/components/ui/use-toast';
import TicketsField from './Tickets/TicketsField';
import ExperienceField from './Experience/ExperienceField';
import {
  ContentProps,
  EditorContentProps,
  PostFeildProps,
  ExperienceFieldProps,
  TicketFieldProps,
  TicketState
} from './types';
import { resizeImage } from '@/lib/utils';
import TicketEditorContent from './TicketEditorContent';
import PostEditorContent from './PostEditorContent';
import ExperienceEditorContent from './ExperienceEditorContent';

const EditorContent: React.FC<EditorContentProps> = ({
  selectedContent,
  selectedTab,
  isOpen,
  onClose,
  entitySearch,
  setEntitySearch,
  fetchEntitySearch,
  hasStripeAccount = true
}) => {
  const { ticketUpsert, entityUploadFiles, experienceUpsert, postUpsert } =
    useApi();
  const formRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [contentTitle, setContentTitle] = useState<ContentProps['title']>('');
  const [contentDescription, setContentDescription] =
    useState<ContentProps['description']>('');
  const [contentSlug, setContentSlug] = useState<ContentProps['slug']>('');
  const [imagePreview, setImagePreview] = useState<any>([]);
  const [uploadImagedata, setUploadImagedata] = useState<Array<any>>([]);
  const [deletePhotoData, setDeletePhotoData] = useState<Array<any>>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentId, setContentId] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  //Post
  const [isCanBook, setIsCanBook] =
    useState<PostFeildProps['isCanBook']>(false);
  const [isSetDateTime, setIsSetDateTime] = useState<boolean>(false);
  const [bookingDate, setBookingDate] = useState<string | null>(null);
  const [bookingTime, setBookingTime] = useState<any | null>(null);
  // Experience
  const [ticketLimit, setTicketLimit] =
    useState<ExperienceFieldProps['ticketLimit']>(0);
  const [ticketPrice, setTicketPrice] =
    useState<ExperienceFieldProps['ticketPrice']>(0);
  const [experienceStartDate, setExperienceStartDate] =
    useState<ExperienceFieldProps['experienceStartDate']>(null);
  const [experienceEndDate, setExperienceEndDate] =
    useState<ExperienceFieldProps['experienceEndDate']>(null);
  const [experienceBookingFee, setExperienceBookingFee] =
    useState<ExperienceFieldProps['experienceBookingFee']>(0);
  const [experienceFlatRate, setExperienceFlatRate] =
    useState<ExperienceFieldProps['experienceFlatRate']>(0);
  const [experienceUntilTime, setExperienceUntilTime] =
    useState<ExperienceFieldProps['experienceUntilTime']>(0);
  const [isReccuring, setIsReccuring] =
    useState<ExperienceFieldProps['isReccuring']>(true);
  const [experienceRecurringType, setExperienceRecurringType] =
    useState<ExperienceFieldProps['experienceRecurringType']>(2);
  const [experienceRecurringValue, setExperienceRecurringValue] =
    useState<ExperienceFieldProps['experienceRecurringValue']>(2);
  const [experienceDayOfWeek, setExperienceDayOfWeek] = useState<
    ExperienceFieldProps['experienceDayOfWeek']
  >([]);
  const [experienceFloor, setExperienceFloor] =
    useState<ExperienceFieldProps['experienceFloor']>(null);
  const [experienceWidgetServiceIds, setExperienceWidgetServiceIds] = useState<
    ExperienceFieldProps['experienceWidgetServiceIds']
  >([]);
  // Tickets
  const [totalTickets, setTotalTickets] =
    useState<TicketState['totalTickets']>(5000);
  const [startSellDate, setStartSellDate] = useState<
    TicketState['startSellDate']
  >(new Date());
  const [endSellDate, setEndSellDate] = useState<TicketState['endSellDate']>(
    new Date()
  );
  const [eventDate, setEventDate] = useState<TicketState['eventDate']>(null);
  const [expirationDate, setExpirationDate] =
    useState<TicketState['expirationDate']>(null);
  const [ticketOptions, setTicketOptions] = useState<
    TicketFieldProps['ticketOptions']
  >([]);
  useEffect(() => {
    // Common
    if (selectedContent?.data?.files?.length > 0) {
      const existingImages = selectedContent?.data?.files.map(
        (file: { id: number; path: string; [key: string]: any }) => {
          return {
            ...file,
            path: `${process.env.NEXT_PUBLIC_IMG_URL}${file.path}`
          };
        }
      );
      setImagePreview(existingImages);
    }
    setContentId(selectedContent?.data?.id || null);

    if (selectedContent) {
      setIsActive(selectedContent.data?.status ?? true);
    } else {
      setIsActive(true);
    }
    setContentSlug(selectedContent?.slug);
    setContentTitle(selectedContent?.name);
    setBookingDate(selectedContent?.data?.date);
    setBookingTime(selectedContent?.data?.time);

    // Post
    if (selectedTab === 'Post') {
      setIsCanBook(selectedContent?.data?.canBook === 1);
    }
    // Experience
    if (selectedTab === 'Experience') {
      setContentDescription(selectedContent?.data?.exp_description || '');
      setExperienceStartDate(
        selectedContent?.data?.experience_shift_connection?.start_date
          ? selectedContent.data.experience_shift_connection.start_date
          : undefined
      );
      setExperienceEndDate(
        selectedContent?.data?.experience_shift_connection?.end_date
          ? selectedContent.data.experience_shift_connection.end_date
          : undefined
      );
      setTicketLimit(selectedContent?.data?.no_of_ticket || 0);
      setTicketPrice(selectedContent?.data?.price || 0);
      setExperienceBookingFee(
        selectedContent?.data?.experience_shift_connection?.booking_fee ?? 0
      );
      setExperienceFlatRate(
        selectedContent?.data?.experience_shift_connection?.flat_rate ?? 0
      );
      setExperienceRecurringType(
        selectedContent?.data?.experience_shift_connection?.recurring_type ?? 2
      );
      setExperienceUntilTime(
        selectedContent?.data?.experience_shift_connection?.until_time ?? 0
      );
      setIsReccuring(
        [0, 1, 2].includes(
          selectedContent?.data?.experience_shift_connection?.recurring_type
        )
      );
      setExperienceRecurringValue(
        selectedContent?.data?.experience_shift_connection?.recurring_value ?? 2
      );
      setExperienceDayOfWeek(
        selectedContent?.data?.experience_shift_connection?.day_of_week || []
      );
      setExperienceFloor(
        selectedContent?.data?.experience_shift_connection?.floors
      );
      setExperienceWidgetServiceIds(
        selectedContent?.data?.experience_shift_connection?.widget_service_ids
      );
    } else {
      setContentDescription(selectedContent?.data?.description || '');
    }
    // Tickets
    if (selectedTab === 'Tickets') {
      setTotalTickets(selectedContent?.data?.maxCapacity);
      setStartSellDate(selectedContent?.data?.startDate);
      setEndSellDate(selectedContent?.data?.endDate);
      setEventDate(selectedContent?.data?.eventDate);
      setExpirationDate(selectedContent?.data?.expirationDate);
      if (selectedContent?.data?.types?.length > 0) {
        setTicketOptions(selectedContent?.data?.types);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  const formatDate = (date: Date | null) => {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  };
  const formatOnlyDate = (date: Date | null) => {
    return moment(date).format('YYYY-MM-DD');
  };

  useEffect(() => {
    if (selectedContent?.data?.date || selectedContent?.data?.time) {
      setIsSetDateTime(true);
    } else {
      setIsSetDateTime(false);
    }
  }, [selectedContent]);
  const resetContentState = () => {
    setContentId(0);
    setIsActive(true);
    setContentTitle('');
    setContentDescription('');
    setContentSlug('');
    setTotalTickets(5000);
    setStartSellDate(new Date());
    setEndSellDate(new Date());
    setEventDate(null);
    setExpirationDate(null);
    setTicketOptions([]);
    setImagePreview([]);
    setUploadImagedata([]);
    setIsCanBook(false);
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      resetContentState();
      onClose();
    }
  };
  const handleClose = () => {
    resetContentState();
    onClose();
  };
  // Image set ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_IMAGE_DIMENSION = 1920;

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    const now = Date.now();

    if (files) {
      const resizedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          let resizedFile = file;
          if (file.size > MAX_FILE_SIZE && file.type.startsWith('image/')) {
            try {
              resizedFile = await resizeImage(
                file,
                MAX_FILE_SIZE,
                MAX_IMAGE_DIMENSION
              );
              console.log(
                `Resized File: ${resizedFile.name}, Size: ${(
                  resizedFile.size / 1024
                ).toFixed(2)} KB`
              );
            } catch (error) {
              console.error(`Error resizing image ${file.name}:`, error);
            }
          }
          return resizedFile;
        })
      );

      const newFiles = resizedFiles.map((file) => ({
        id: now,
        path: URL.createObjectURL(file),
        file_type: file.type,
        fileable_id: 0,
        fileable_type: ''
      }));

      setImagePreview((prev: any) => [...prev, ...newFiles]);
      setUploadImagedata((prev: any) => [...prev, ...resizedFiles]);
    }
  };
  const getFinalTicketOptions = () => {
    if (!selectedContent) {
      // add ticket
      return ticketOptions.filter((opt) => opt.is_deleted !== 1);
    } else {
      // edit ticket
      return ticketOptions.filter(
        (opt) => !(opt.is_deleted === 1 && opt.is_new === true)
      );
    }
  };
  const handleDeletePhoto = (id: number) => {
    setImagePreview((prev: any) =>
      prev.map((image: any) =>
        image.id === id ? { ...image, is_deleted: true } : image
      )
    );
    setUploadImagedata((prev: any) =>
      prev.filter((file: any) => file.id !== id)
    );
    setDeletePhotoData((prev) => [...prev, { id, is_deleted: true }]);
  };

  // Save Content ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const buildParams = (isDeleted = false) => {
    const statusToSave = isActive ? 1 : 0;

    let baseParams: any = {
      id: contentId || null,
      slug: contentSlug || 'content',
      status: statusToSave,
      is_deleted: isDeleted ? 1 : 0,
      name: contentTitle,
      description: contentDescription
    };

    if (selectedTab === 'Tickets') {
      baseParams = {
        ...baseParams,
        maxCapacity: totalTickets || 5000,
        startDate: formatDate(startSellDate),
        endDate: formatDate(endSellDate),
        eventDate: formatDate(eventDate),
        expirationDate: formatDate(expirationDate),
        types: getFinalTicketOptions().map((option) => ({
          id: option.id,
          name: option.name,
          limit: option.limit,
          price: option.price,
          validityFrom: formatDate(option.validityFrom),
          validityTo: formatDate(option.validityTo),
          is_active: option.is_active ? 1 : 0,
          is_deleted: option.is_deleted ? 1 : 0
        })),
        date: null,
        time: null
      };
    } else if (selectedTab === 'Experience') {
      baseParams = {
        ...baseParams,
        exp_name: contentTitle,
        exp_description: contentDescription,
        experience_shift_connection: {
          booking_fee: experienceBookingFee ?? 0,
          day_of_week: experienceRecurringType === 2 ? experienceDayOfWeek : [],
          recurring_value: experienceRecurringValue ?? 0,
          recurring_type: experienceRecurringType ?? 0,
          start_date: formatOnlyDate(experienceStartDate) ?? null,
          end_date: formatOnlyDate(experienceEndDate) ?? null,
          id: selectedContent?.data?.experience_shift_connection?.id,
          flat_rate: experienceFlatRate ?? 0,
          widget_service_ids: experienceWidgetServiceIds ?? [],
          until_time: experienceUntilTime
        },
        price: ticketPrice ?? 0,
        no_of_ticket: ticketLimit ?? 0,
        files: []
      };
    } else if (selectedTab === 'Post') {
      baseParams = {
        ...baseParams,
        canBook: isCanBook ? 1 : 0,
        files: []
      };
      if (isCanBook && isSetDateTime) {
        baseParams = {
          ...baseParams,
          date: bookingDate,
          time: bookingTime
        };
      }
    }

    return baseParams;
  };

  const handleSave = async () => {
    if (selectedTab === 'Tickets' && !hasStripeAccount) {
      toast({
        title: 'Stripe Account Required',
        description: 'You need to connect a Stripe account to create tickets.',
        variant: 'destructive'
      });
      return;
    }

    const params = buildParams();
    if (deletePhotoData.length > 0) {
      params.files = deletePhotoData;
    }
    try {
      setIsSaving(true);
      let newId = contentId;
      if (['Tickets', 'Experience', 'Post'].includes(selectedTab)) {
        if (selectedTab === 'Tickets') {
          params.postType = 'ticket';
        } else if (selectedTab === 'Experience') {
          params.postType = 'experience';
        } else if (selectedTab === 'Post') {
          params.postType = 'post';
        }
        let response;
        if (!params.id) {
          if (selectedTab === 'Tickets') {
            response = await ticketUpsert(params);
            newId = response.data.ticket.id;
          } else if (selectedTab === 'Experience') {
            response = await experienceUpsert(params);
            newId = response.data.experience.id;
          } else if (selectedTab === 'Post') {
            response = await postUpsert(params);
            newId = response.data.post.id;
          }
        } else {
          if (selectedTab === 'Tickets') {
            response = await ticketUpsert(params);
            newId = response.data.ticket.id;
          } else if (selectedTab === 'Experience') {
            response = await experienceUpsert(params);
            newId = response.data.experience.id;
          } else if (selectedTab === 'Post') {
            response = await postUpsert(params);
            newId = response.data.post.id;
          }
        }
        if (newId && uploadImagedata.length > 0) {
          params.id = newId;
          for (const imageData of uploadImagedata) {
            await entityUploadFiles(params, imageData);
          }
          setUploadImagedata([]);
        }
        fetchEntitySearch();
        handleClose();
        toast({
          title: 'Content Saved',
          description: 'The content has been saved',
          variant: 'success'
        });
      } else {
        console.log('No content type selected');
      }
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.message ||
        (error as any).message ||
        'An unexpected error occurred';
      toast({
        title: 'Error',
        description: `Failed to save content: ${errorMessage}`,
        variant: 'destructive'
      });
      console.log('Error uploading images or saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };
  // Delete Content ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const handleDeleteModalOpen = () => {
    setDeleteModalOpen(true);
  };
  const handleDeleteContent = async () => {
    const params = buildParams(true);
    try {
      if (selectedTab === 'Experience') {
        await experienceUpsert(params);
      } else if (selectedTab === 'Tickets') {
        await ticketUpsert(params);
      } else if (selectedTab === 'Post') {
        await postUpsert(params);
      } else {
        throw new Error('Invalid tab selected');
      }
      setDeleteModalOpen(false);
      setEntitySearch(
        entitySearch.filter((content: any) => content.data.id !== contentId)
      );
      handleClose();
      toast({
        title: 'Content Deleted',
        variant: 'success',

        description: 'The content has been deleted'
      });
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive'
      });
    }
  };

  return (
    <div
      ref={formRef}
      onMouseDown={(e) => e.stopPropagation()}
      className={`fixed right-0 top-0 z-40 h-full w-full transform overflow-y-scroll bg-background shadow-lg transition-transform duration-300 ease-in-out 
        ${selectedTab !== 'Post' ? 'md:w-2/3' : 'md:w-1/3'}
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {selectedTab === 'Tickets' && !hasStripeAccount ? (
        <div className="p-6">
          <div className="mb-4 border-l-4 border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-medium">Stripe Account Required</p>
            <p>
              You need to connect a Stripe account to create tickets. Please
              connect your Stripe account in the settings.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="relative p-6" ref={formRef}>
          <div>
            {selectedTab === 'Tickets' && (
              <TicketEditorContent
                selectedContent={selectedContent}
                imagePreview={imagePreview}
                isActive={isActive}
                handleDeletePhoto={handleDeletePhoto}
                setIsActive={setIsActive}
                handleImageUpload={handleImageUpload}
                contentTitle={contentTitle}
                setContentTitle={setContentTitle}
                contentDescription={contentDescription}
                setContentDescription={setContentDescription}
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
                handleSave={handleSave}
                handleDeleteModalOpen={handleDeleteModalOpen}
                isSaving={isSaving}
                handleClose={handleClose}
              />
            )}
            {selectedTab === 'Post' && (
              <PostEditorContent
                selectedContent={selectedContent}
                imagePreview={imagePreview}
                isActive={isActive}
                handleDeletePhoto={handleDeletePhoto}
                setIsActive={setIsActive}
                handleImageUpload={handleImageUpload}
                contentTitle={contentTitle}
                setContentTitle={setContentTitle}
                contentDescription={contentDescription}
                setContentDescription={setContentDescription}
                isCanBook={isCanBook}
                setIsCanBook={setIsCanBook}
                isSetDateTime={isSetDateTime}
                setIsSetDateTime={setIsSetDateTime}
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                bookingTime={bookingTime}
                setBookingTime={setBookingTime}
                handleSave={handleSave}
                handleDeleteModalOpen={handleDeleteModalOpen}
                isSaving={isSaving}
                handleClose={handleClose}
              />
            )}
            {selectedTab === 'Experience' && (
              <ExperienceEditorContent
                contentDescription={contentDescription}
                contentTitle={contentTitle}
                experienceBookingFee={experienceBookingFee}
                experienceDayOfWeek={experienceDayOfWeek}
                experienceEndDate={experienceEndDate}
                experienceFlatRate={experienceFlatRate}
                experienceFloor={experienceFloor}
                experienceRecurringType={experienceRecurringType}
                experienceRecurringValue={experienceRecurringValue}
                experienceStartDate={experienceStartDate}
                experienceUntilTime={experienceUntilTime}
                experienceWidgetServiceIds={experienceWidgetServiceIds}
                handleClose={handleClose}
                handleDeleteModalOpen={handleDeleteModalOpen}
                handleDeletePhoto={handleDeletePhoto}
                handleImageUpload={handleImageUpload}
                handleSave={handleSave}
                imagePreview={imagePreview}
                isActive={isActive}
                isOpen={isOpen}
                isReccuring={isReccuring}
                selectedContent={selectedContent}
                setContentDescription={setContentDescription}
                setContentTitle={setContentTitle}
                setExperienceBookingFee={setExperienceBookingFee}
                setExperienceDayOfWeek={setExperienceDayOfWeek}
                setExperienceEndDate={setExperienceEndDate}
                setExperienceFlatRate={setExperienceFlatRate}
                setExperienceFloor={setExperienceFloor}
                setExperienceRecurringType={setExperienceRecurringType}
                setExperienceRecurringValue={setExperienceRecurringValue}
                setExperienceStartDate={setExperienceStartDate}
                setExperienceUntilTime={setExperienceUntilTime}
                setExperienceWidgetServiceIds={setExperienceWidgetServiceIds}
                setIsActive={setIsActive}
                setIsReccuring={setIsReccuring}
                setTicketLimit={setTicketLimit}
                setTicketPrice={setTicketPrice}
                ticketLimit={ticketLimit}
                ticketPrice={ticketPrice}
              />
            )}
          </div>
          <Modal
            description="Are you sure you want to delete this content?"
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title="Delete Content"
          >
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant={'danger'} onClick={() => handleDeleteContent()}>
                Delete
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};
export default EditorContent;
