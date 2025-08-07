import React, { useEffect } from 'react';
import { Pencil, Trash, Copy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useApi } from '@/hooks/useApi';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface FlowControlServiceListProps {
  handleDetailOpen: (service: any) => void;
  selectedDay: any;
  selectedService: any;
  setSelectedService: React.Dispatch<React.SetStateAction<any>>;
  isDayActivated: boolean;
  setWidgetSettingsData: React.Dispatch<React.SetStateAction<any>>;
  copiedService: any;
  setCopiedService: React.Dispatch<React.SetStateAction<any>>;
}

const FlowControlServiceList: React.FC<FlowControlServiceListProps> = ({
  handleDetailOpen,
  selectedDay,
  selectedService,
  setSelectedService,
  isDayActivated,
  setWidgetSettingsData,
  copiedService,
  setCopiedService
}) => {
  const { widgetDaySettings, deleteWidgetService, saveAccountSettings } =
    useApi();
  const { toast } = useToast();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(selectedDay?.is_open || false);

  useEffect(() => {
    if (selectedDay) {
      setIsOpen(selectedDay.is_open || false);
    }
  }, [selectedDay]);

  useEffect(() => {
    setIsOpen(selectedDay?.is_open || false);
  }, [selectedDay]);
  const asyncSelectedDayFunction = async () => {
    const params = {
      day_number: selectedDay.day,
      is_open: isDayActivated
    };
    try {
      const response = await widgetDaySettings(params);
      console.log('response', response);
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleDayOpen = async (checked: boolean) => {
    setIsOpen(checked);

    await asyncSelectedDayFunction();

    if (selectedDay?.fetchedData) {
      for (const item of selectedDay.fetchedData) {
        const params = {
          ...item,
          service: {
            ...item.service,
            is_open: checked
          }
        };

        try {
          await saveAccountSettings(params);
          toast({
            title: 'Success',
            variant: 'success',
            duration: 20000
          });
        } catch (error) {
          console.error('Error saving service:', error);
          toast({
            title: 'Error',
            className: 'bg-red-500 text-white',
            duration: 20000
          });
        }
      }
    }

    setWidgetSettingsData((prev: any) => {
      return {
        ...prev,
        [selectedDay.day]: {
          ...prev[selectedDay.day],
          is_open: checked,
          fetchedData: prev[selectedDay.day].fetchedData.map((item: any) => {
            return {
              ...item,
              service: {
                ...item.service,
                is_open: checked
              }
            };
          })
        }
      };
    });
  };

  const handleCopyService = (item: any) => {
    setCopiedService(item);
    toast({
      title: 'Service copied',
      duration: 20000,
      variant: 'success'
    });
  };

  const hanslePaste = () => {
    if (copiedService) {
      const {
        service: { id, ...restService },
        ...restCopiedService
      } = copiedService;
      const pastedService = {
        ...restCopiedService,
        service: { ...restService, day_number: selectedDay.day },
        day: {
          day_name: selectedDay.day_name,
          day_number: selectedDay.day,
          is_open: selectedDay.is_open
        },
        day_number: selectedDay.day
      };

      handleDetailOpen(pastedService);
    } else {
      toast({
        title: 'No service copied',
        variant: 'destructive',
        duration: 20000
      });
    }
  };

  const handleDeleteService = async () => {
    const params = {
      service_id: selectedService.service.id
    };
    try {
      const response = await deleteWidgetService(params);
      console.log('response', response);
      toast({
        title: 'Success',
        variant: 'success',

        duration: 20000
      });
    } catch (error) {
      console.error('error', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        duration: 20000
      });
    }
    setWidgetSettingsData((prev: any) => {
      const updatedFetchedData = prev[selectedDay.day].fetchedData.filter(
        (item: any) => item.service.id !== selectedService.service.id
      );

      return {
        ...prev,
        [selectedDay.day]: {
          ...prev[selectedDay.day],
          fetchedData: updatedFetchedData
        }
      };
    });
    setSelectedService(null);

    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="mb-8">
              <Label className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="">
                          <Info size={16} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Turning this off will disable all services for this day.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* All service will be turn on or off */}
                  <p className="font-semibold">{selectedDay?.name}</p>
                </div>
                <Switch
                  checked={isOpen}
                  onCheckedChange={(checked) => handleDayOpen(checked)}
                />
              </Label>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant={'outline'} onClick={hanslePaste}>
              Paste Service
            </Button>
            <Button
              variant={'outline'}
              onClick={(e) => {
                handleDetailOpen(null);
              }}
            >
              Add Service
            </Button>
          </div>
        </div>
        {/* Service Table */}
        <div className="overflow-x-auto">
          <TableForFixedHeader className="sticky top-0 bg-secondary">
            <TableHeader
              className="sticky z-10 bg-secondary"
              style={{ top: '-1px' }}
            >
              <TableRow>
                <TableHead className="w-auto">Service</TableHead>
                <TableHead className="w-auto">Time</TableHead>
                <TableHead className="w-auto">Description</TableHead>
                <TableHead className="w-auto">Floor</TableHead>
                <TableHead className="w-20 text-center">Copy</TableHead>
                <TableHead className="w-20 text-center">Delete</TableHead>
                <TableHead className="w-20 text-center">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDay?.fetchedData &&
              selectedDay?.fetchedData?.length > 0 ? (
                selectedDay?.fetchedData.map((item: any, index: number) => {
                  const { service } = item;
                  const { time_setting } = item;
                  const { sections_setting } = item;
                  // const { payment } = item;
                  const activeFloors = sections_setting
                    .filter((item: any) => item.status === true)
                    .map((item: any) => item.floor_name)
                    .join(', ');
                  return (
                    <TableRow key={index} className="border-b hover:bg-muted">
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-4">
                          <span
                            className={`mr-2 h-2 w-2 rounded-full ${
                              service.is_open ? 'bg-green-500' : 'bg-red-500'
                            } flex-shrink-0`}
                            style={{ display: 'inline-block' }}
                          ></span>
                          {service.service_name}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <p>
                          {moment()
                            .startOf('day')
                            .seconds(time_setting?.service_start_time || 0)
                            .format('h:mm A')}{' '}
                          -{' '}
                          {moment()
                            .startOf('day')
                            .seconds(time_setting?.last_booking_time || 0)
                            .format('h:mm A')}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        {service.service_description}
                      </TableCell>
                      <TableCell className="p-4">{activeFloors}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          className="mx-auto flex items-center px-3"
                          variant={'ghost'}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopyService(item);
                          }}
                        >
                          <Copy size={22} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          className="mx-auto flex items-center px-3"
                          variant={'ghost'}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedService(item);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash size={22} />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          className="mx-auto flex items-center px-3"
                          variant={'ghost'}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDetailOpen(item);
                          }}
                        >
                          <Pencil size={22} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-4 text-center">
                    No services available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableForFixedHeader>
        </div>
      </div>
      <Modal
        title="Delete Service"
        description="Are you sure you want to delete this service?"
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
      >
        <div className="flex-end flex gap-2">
          <Button
            variant={'secondary'}
            onClick={() => {
              setIsDeleteModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button variant={'danger'} onClick={() => handleDeleteService()}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default FlowControlServiceList;
