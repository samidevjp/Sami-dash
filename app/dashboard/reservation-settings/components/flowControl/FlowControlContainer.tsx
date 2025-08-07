import React, { useState, useEffect, useRef, useContext } from 'react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import FlowControlServiceList from './FlowControlServiceList';
import ServicesPanel from './ServicesPanel';
import FlowControlDetailTabMenu from './FlowControlDetailTabMenu';
import TimeSettingsPanel from './TimeSettingsPanel';
import SectionPanel from './SectionPanel';
import PaymentsPanel from './PaymentsPanel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import moment from 'moment';
import { daysOfWeek } from '@/app/dashboard/team/components/common/const';
import { TableContext } from '@/hooks/useBookings';
interface TimeItem {
  time: number;
  covers: number | null;
  created_at: string;
  updated_at: string;
}
interface Sections {
  id: number;
  floor_id: number;
  floor_name: string;
  booking_interval: number;
  status: boolean;
  time_items?: TimeItem[];
}
interface FlowControlContainerProps {
  widgetSettingsData: any;
  setWidgetSettingsData: React.Dispatch<React.SetStateAction<any>>;
  selectedDay: any;
  setSelectedDay: React.Dispatch<React.SetStateAction<any>>;
  isDayActivated: boolean;
  fetchDay: (day: number) => void;
  getWidgetDaySettingsFunction: (flag: boolean) => void;
  copiedService: any;
  setCopiedService: React.Dispatch<React.SetStateAction<any>>;
}
const FlowControlContainer: React.FC<FlowControlContainerProps> = ({
  fetchDay,
  getWidgetDaySettingsFunction,
  widgetSettingsData,
  setWidgetSettingsData,
  selectedDay,
  setSelectedDay,
  isDayActivated,
  copiedService,
  setCopiedService
}) => {
  const { saveAccountSettings, uploadPhotoService } = useApi();
  const { toast } = useToast();
  const { floorsName } = useContext(TableContext);
  const formRef = useRef<HTMLDivElement>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<any>();
  // Services section
  const [serviceName, setServiceName] = React.useState('');
  const [description, setDescription] = useState('');
  const [servicePhoto, setServicePhoto] = useState('');
  const [uploadPhotoData, setUploadPhotoData] = useState<any>(null);
  // Time setting section
  const [serviceStartTime, setServiceStartTime] = useState(0);
  const [bookingEndTime, setBookingEndTime] = useState(0);
  const [bookingDuration, setBookingDuration] = useState(0);
  const [isEnableCustomTurnTimes, setIsEnableCustomTurnTimes] = useState(false);
  const [customeTurnTimes, setCustomeTurnTimes] = useState<any[]>([]);
  const [allowableDaysBooking, setAllowableDaysBooking] = useState('0');
  const [isWaitlistEnabled, setIsWaitlistEnabled] = useState(false);
  const [weitlistCapacity, setWeitlistCapacity] = useState('0');
  const [isChooseSection, setIsChooseSection] = useState(true);
  const [createTurnTimeData, setCreateTurnTimeData] = useState<any[]>([]);
  // const [deleteTurnTimeData, setDeleteTurnTimeData] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = React.useState('Services');
  const [isServiceFlowActivated, setIsServiceFlowActivated] =
    React.useState(true);
  // Section section

  const [sections, setSections] = useState<any[]>([]);
  const [sectionStart, setSectionStart] = useState(0);
  const [sectionEnd, setSectionEnd] = useState(0);
  const updateSectionsWithInterval = (newSections: Sections[]) => {
    const updatedSections = newSections.map((section) => {
      const startTime = moment().startOf('day').seconds(serviceStartTime);
      const endTime = moment().startOf('day').seconds(bookingEndTime);
      const timeItems: TimeItem[] = [];
      for (
        let time = startTime.clone();
        time.isBefore(endTime);
        time.add(section.booking_interval, 'seconds')
      ) {
        timeItems.push({
          time: time.diff(moment().startOf('day'), 'seconds'),
          covers: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      return {
        ...section,
        time_items: timeItems
      };
    });
    setSections(updatedSections);
  };
  const handleStartTimeChange = (time: string) => {
    const momentTime = moment(time, 'HH:mm');
    const seconds = momentTime.hours() * 3600 + momentTime.minutes() * 60;
    setServiceStartTime(seconds);
    setSectionStart(seconds);
  };
  const handleEndTimeChange = (time: string) => {
    const momentTime = moment(time, 'HH:mm');
    const seconds = momentTime.hours() * 3600 + momentTime.minutes() * 60;
    setBookingEndTime(seconds);
    setSectionEnd(seconds);
  };
  useEffect(() => {
    updateSectionsWithInterval(sections);
  }, [sectionStart, sectionEnd]);
  // Payments section
  const [paymentType, setPaymentType] = useState<string>('0');
  const [paymentValue, setPaymentValue] = useState<number>(0);

  const handleDetailOpen = (item: any) => {
    const serviceStart = item?.time_setting?.service_start_time || 0;
    const bookingEnd = item?.time_setting?.last_booking_time || 0;
    const bookingInterval = item?.time_setting?.booking_duration || 7200;

    setIsDetailOpen(true);
    setSelectedService(item);
    setServiceName(item?.service?.service_name || '');
    setDescription(item?.service?.service_description || '');
    setServicePhoto(item?.service?.photo || '');
    setServiceStartTime(serviceStart);
    setBookingEndTime(bookingEnd);
    setBookingDuration(bookingInterval);
    setIsEnableCustomTurnTimes(item?.time_setting?.enable_turn_times || false);
    setCustomeTurnTimes(item?.time_setting?.enable_turn_times_items || []);
    setAllowableDaysBooking(item?.time_setting?.allowable_days_booking || 0);
    setIsWaitlistEnabled(item?.time_setting?.is_to_waitlist || false);
    setWeitlistCapacity(item?.time_setting?.waitlist_capacity || 0);
    setIsChooseSection(item?.time_setting?.is_choose_section || false);
    setPaymentType(item?.payment?.payment_type || '0');
    setPaymentValue(item?.payment?.value || 0);

    // Generate default sections
    const generatedSections = floorsName.map((floor) => {
      const startTime = moment().startOf('day').seconds(serviceStart);
      const endTime = moment().startOf('day').seconds(bookingEnd);
      const timeItems: TimeItem[] = [];

      for (
        let time = startTime.clone();
        time.isBefore(endTime);
        time.add(bookingInterval, 'seconds')
      ) {
        timeItems.push({
          time: time.diff(moment().startOf('day'), 'seconds'),
          covers: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      return {
        floor_id: floor.id,
        floor_name: floor.name,
        booking_interval: bookingInterval,
        status: false,
        time_items: timeItems
      };
    });

    // Merge generatedSections with item.sections_setting by floor_id
    const mergedSections = generatedSections.map((genSection) => {
      const matchedSection = item?.sections_setting?.find(
        (section: any) => section.floor_id === genSection.floor_id
      );
      return matchedSection ? { ...genSection, ...matchedSection } : genSection;
    });

    // Add remaining sections from item.sections_setting that are not in generatedSections
    const additionalSections = item?.sections_setting?.filter(
      (section: any) =>
        !generatedSections.some(
          (genSection) => genSection.floor_id === section.floor_id
        )
    );

    setSections([...mergedSections, ...(additionalSections || [])]);
    setIsServiceFlowActivated(item?.service?.is_open || false);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
  };
  useEffect(() => {
    console.log(selectedService, 'selectedService');
  }, [selectedService]);
  const handleSave = async () => {
    const params = {
      ...selectedService,
      day: {
        day_name: selectedDay.name,
        day_number: selectedDay.day
      },
      service: {
        ...selectedService?.service,
        is_open: isServiceFlowActivated || false,
        service_name: serviceName || '',
        service_description: description || ''
      },
      time_setting: {
        ...selectedService?.time_setting,
        service_start_time: serviceStartTime || 0,
        last_booking_time: bookingEndTime || 0,
        booking_duration: bookingDuration || 0,
        enable_turn_times: isEnableCustomTurnTimes || false,
        enable_turn_times_items: customeTurnTimes || [],
        allowable_days_bookings: allowableDaysBooking || 0,
        is_to_waitlist: isWaitlistEnabled || false,
        waitlist_capacity: weitlistCapacity || 0,
        is_choose_section: isChooseSection || false
      },
      sections_setting: sections || [],
      payment: {
        ...selectedService?.payment,
        payment_type: Number(paymentType) || 0,
        value: paymentValue || 0
      }
    };
    try {
      if (uploadPhotoData) {
        const params = {
          image: uploadPhotoData,
          id: selectedService?.service?.id
        };
        try {
          await uploadPhotoService(params.id, params.image);
        } catch (error) {
          console.error('error', error);
        }
      }
      const response = await saveAccountSettings(params);
      console.log(response, 'response');
      setSelectedService(params);
      fetchDay(selectedDay.day);
      setWidgetSettingsData((prevData: any) => {
        const updatedData = { ...prevData };
        const dayIndex = Object.keys(updatedData).find(
          (key) => updatedData[key].day === selectedService?.day?.day_number
        );
        if (dayIndex !== undefined) {
          updatedData[dayIndex] = {
            ...updatedData[dayIndex],
            fetchedData: {
              ...updatedData[dayIndex].fetchedData,
              ...params
            }
          };
        }
        return updatedData;
      });
      getWidgetDaySettingsFunction(true);
      handleDetailClose();
      toast({
        duration: 20000,
        title: 'Success',
        variant: 'success',
        description: 'Saved successfully!'
      });
    } catch (error) {
      console.error('error', error);
      // @ts-ignore
      if (error instanceof Error && error?.response && error?.response?.data) {
        toast({
          title: 'Error',
          // @ts-ignore
          description: error?.response?.data?.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unknown error occurred',
          variant: 'destructive'
        });
      }
    }
  };
  useEffect(() => {
    setSelectedDay(widgetSettingsData[daysOfWeek[selectedDay?.name]]);
  }, [widgetSettingsData]);
  const handleClickOutside = (event: MouseEvent) => {
    if (formRef.current && !formRef.current.contains(event.target as Node)) {
      handleDetailClose();
    }
  };
  useEffect(() => {
    if (isDetailOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDetailOpen]);
  return (
    <div className="relative h-screen w-full overflow-y-scroll p-6">
      <FlowControlServiceList
        handleDetailOpen={handleDetailOpen}
        selectedDay={selectedDay}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        isDayActivated={isDayActivated}
        setWidgetSettingsData={setWidgetSettingsData}
        copiedService={copiedService}
        setCopiedService={setCopiedService}
      />
      <div
        ref={formRef}
        onMouseDown={(e) => e.stopPropagation()}
        className={`fixed right-0 top-0 z-40 h-full w-full transform overflow-y-scroll bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out md:w-2/3
        ${isDetailOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="relative">
          <Button
            variant={'ghost'}
            onClick={handleDetailClose}
            className="mb-2 p-1"
          >
            <X size={24} /> Close
          </Button>
          <div className="border-b p-6">
            {/* <p>{selectedService?.day?.day_name}</p> */}
            <div className="flex items-center justify-between">
              <Label className="leading-2 flex items-center justify-between gap-6">
                <div className="">
                  <p>
                    {selectedService?.service?.service_name}{' '}
                    <p>
                      {moment()
                        .startOf('day')
                        .seconds(
                          selectedService?.time_setting?.service_start_time || 0
                        )
                        .format('h:mm A')}{' '}
                      -{' '}
                      {moment()
                        .startOf('day')
                        .seconds(
                          selectedService?.time_setting?.last_booking_time || 0
                        )
                        .format('h:mm A')}
                    </p>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isServiceFlowActivated}
                    onCheckedChange={(checked) =>
                      setIsServiceFlowActivated(checked)
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    This Service flow is{' '}
                    {isServiceFlowActivated ? 'activated' : 'deactivated'}
                  </span>
                </div>
              </Label>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
          <FlowControlDetailTabMenu
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <div className="p-6">
            {selectedTab === 'Services' && (
              <ServicesPanel
                serviceName={serviceName}
                setServiceName={setServiceName}
                description={description}
                setDescription={setDescription}
                servicePhoto={servicePhoto}
                setServicePhoto={setServicePhoto}
                setUploadPhotoData={setUploadPhotoData}
              />
            )}
            {selectedTab === 'Time Settings' && (
              <TimeSettingsPanel
                serviceStartTime={serviceStartTime}
                bookingEndTime={bookingEndTime}
                bookingDuration={bookingDuration}
                setBookingDuration={setBookingDuration}
                isEnableCustomTurnTimes={isEnableCustomTurnTimes}
                setIsEnableCustomTurnTimes={setIsEnableCustomTurnTimes}
                customeTurnTimes={customeTurnTimes}
                setCustomeTurnTimes={setCustomeTurnTimes}
                allowableDaysBooking={allowableDaysBooking}
                setAllowableDaysBooking={setAllowableDaysBooking}
                isWaitlistEnabled={isWaitlistEnabled}
                setIsWaitlistEnabled={setIsWaitlistEnabled}
                weitlistCapacity={weitlistCapacity}
                setWeitlistCapacity={setWeitlistCapacity}
                isChooseSection={isChooseSection}
                setIsChooseSection={setIsChooseSection}
                setCreateTurnTimeData={setCreateTurnTimeData}
                handleStartTimeChange={handleStartTimeChange}
                handleEndTimeChange={handleEndTimeChange}
              />
            )}
            {selectedTab === 'Section' && (
              <SectionPanel
                sections={sections}
                setSections={setSections}
                updateSectionsWithInterval={updateSectionsWithInterval}
              />
            )}
            {selectedTab === 'Payments' && (
              <PaymentsPanel
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                paymentValue={paymentValue}
                setPaymentValue={setPaymentValue}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FlowControlContainer;
