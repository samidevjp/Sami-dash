import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import moment from 'moment';
import { ExperienceFieldProps } from '../types';
const ExperienceField: React.FC<ExperienceFieldProps> = ({
  isOpen,
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
  experienceWidgetServiceIds,
  setExperienceWidgetServiceIds
}) => {
  const { widgetSettings } = useApi();
  const [widgetSettingsData, setWidgetSettingsData] = useState<{
    [key: number]: { name: string; [key: string]: any };
  }>({});
  const formatDateForInput = (date: Date | null) =>
    date ? moment(date).format('YYYY-MM-DD') : '';
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputTime = e.target.value;
    const momentTime = moment(inputTime, 'HH:mm');
    const totalSeconds = momentTime.hours() * 3600 + momentTime.minutes() * 60;
    setExperienceUntilTime(totalSeconds);
  };
  useEffect(() => {
    console.log('experienceUntilTime', experienceUntilTime);
  }, [experienceUntilTime]);
  const recurringTypes = [
    { label: 'Weekly', value: 2 },
    { label: 'Monthly', value: 1 },
    { label: 'Yearly', value: 0 },
    { label: 'none', value: -1 }
  ];
  const recurringValues = {
    NONE: { value: 0, label: 'None' },
    EVERY_DAY_OF_MONTH: { value: 1, label: 'Every Day of the Month' },
    EVERY_DATE_OF_MONTH: { value: 2, label: 'Every Date of the Month' },
    EVERY_NUM_WEEK_OF_MONTH: { value: 3, label: 'Every Nth Week of the Month' },
    EVERY_MONTH_DATE_OF_YEAR: {
      value: 4,
      label: 'Every Month Date of the Year'
    },
    EVERY_WEEK_OF_THE_YEAR: { value: 5, label: 'Every Week of the Year' }
  };
  const daysOfWeek = [
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'Th', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
    { label: 'Su', value: 7 }
  ];
  const daysOfWeekMap: { [key: number]: string } = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
  };
  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const formatDateWithSuffix = (date: Date | string) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }
    const dayOfMonth = parsedDate.getDate();
    return `${dayOfMonth}${getOrdinalSuffix(dayOfMonth)} of month`;
  };
  const formatNthDayOfWeek = (date: Date | string) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    const day = parsedDate.getDay();
    const weekOfMonth = Math.ceil(parsedDate.getDate() / 7);
    return `${weekOfMonth}${getOrdinalSuffix(weekOfMonth)} ${
      daysOfWeek[day]
    } of month`;
  };
  useEffect(() => {
    const widgetSettingsData = Object.entries(daysOfWeekMap).reduce(
      (acc, [key, value]) => {
        acc[parseInt(key)] = { name: value, fetchedData: [] };
        return acc;
      },
      {} as { [key: number]: { name: string; [key: string]: any } }
    );
    setWidgetSettingsData(widgetSettingsData);
  }, [isOpen]);
  const fetchedAllDay = async (day: number) => {
    try {
      const params = {
        day_number: day
      };
      const response = await widgetSettings(params);
      return { day, fetchedData: response.data.widget_settings };
    } catch (error) {
      console.error(`Error fetching data for day ${day}:`, error);
      return { day, fetchedData: null };
    }
  };
  const fetchAllDays = async () => {
    try {
      const dayPromises = Array.from({ length: 7 }, (_, index) => {
        const day = index + 1;
        return fetchedAllDay(day);
      });
      const allResults = await Promise.all(dayPromises);
      setWidgetSettingsData((prev) => {
        const newData = { ...prev };
        allResults.forEach(({ day, fetchedData }) => {
          if (fetchedData !== null) {
            newData[day] = {
              ...prev[day],
              fetchedData
            };
          }
        });
        return newData;
      });
    } catch (error) {
      console.error('Error fetching all days:', error);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchAllDays();
    }
  }, [isOpen]);
  const asyncFunction = async () => {
    try {
      for (const day of experienceDayOfWeek) {
        const params = { day_number: day };
        const response = await widgetSettings(params);
        setWidgetSettingsData((prev) => ({
          ...prev,
          [day]: {
            ...prev[day],
            fetchedData: response.data.widget_settings
          }
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (isOpen) {
      asyncFunction();
    }
  }, [isOpen]);
  const handleButtonClick = async (day: number) => {
    if (experienceDayOfWeek.includes(day)) {
      setExperienceDayOfWeek((prev) => prev.filter((item) => item !== day));
    } else {
      setExperienceDayOfWeek((prev) => [...prev, day]);
    }
  };
  const handleAddService = (service: any) => {
    if (
      Array.isArray(experienceWidgetServiceIds) &&
      experienceWidgetServiceIds.includes(service.service.id)
    ) {
      setExperienceWidgetServiceIds((prev) =>
        prev.filter((item) => item !== service.service.id)
      );
    } else {
      setExperienceWidgetServiceIds((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        service.service.id
      ]);
    }
  };
  useEffect(() => {
    if (!isReccuring) {
      setExperienceRecurringType(-1);
      setExperienceDayOfWeek([]);
    }
    if (experienceRecurringType === -1) {
      setExperienceRecurringType(2);
    }
  }, [isReccuring]);
  return (
    <div>
      <Card className="mb-4 border-none bg-secondary">
        <CardHeader>
          <h2>Experience Setting</h2>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <Label>
              Ticket Limit
              <Input
                type="number"
                value={ticketLimit ?? ''}
                onChange={(e) => setTicketLimit(Number(e.target.value))}
                className="mt-1"
              />
            </Label>
            <Label>
              Ticket Price
              <Input
                type="number"
                value={ticketPrice ?? ''}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                className="mt-1"
              />
            </Label>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <Label>
              Start Date
              <Input
                type="date"
                value={formatDateForInput(
                  experienceStartDate ? experienceStartDate : new Date()
                )}
                onChange={(e) =>
                  setExperienceStartDate(new Date(e.target.value))
                }
                className="mt-1"
              />
            </Label>
            <Label>
              End Date
              <Input
                type="date"
                value={formatDateForInput(experienceEndDate)}
                onChange={(e) => setExperienceEndDate(new Date(e.target.value))}
                className="mt-1"
              />
            </Label>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <Label>
              Booking Fee
              <Input
                type="number"
                value={experienceBookingFee}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setExperienceBookingFee(Number(value));
                  }
                }}
                className="mt-1"
              />
            </Label>
            <Label>
              Flat Rate
              <Input
                type="number"
                value={experienceFlatRate}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setExperienceFlatRate(Number(value));
                  }
                }}
                className="mt-1"
              />
            </Label>
          </div>
          <Label>
            Accept booking until
            <Input
              type="time"
              value={moment()
                .startOf('day')
                .seconds(experienceUntilTime)
                .format('HH:mm')}
              onChange={handleTimeChange}
              className="mt-1"
            />
          </Label>
        </CardContent>
      </Card>
      <Card className="border-none bg-secondary">
        <CardHeader>
          <Label className="flex items-center gap-4">
            <p>Is Recurring</p>
            <Switch checked={isReccuring} onCheckedChange={setIsReccuring} />
          </Label>
          {isReccuring &&
            (!experienceEndDate || !moment(experienceEndDate).isValid()) && (
              <p className="text-sm text-muted-foreground">
                *End date is required for recurring experience
              </p>
            )}
        </CardHeader>
        {isReccuring && (
          <CardContent>
            <div className="mb-4">
              <Label>
                <p className="mb-4">Recurring Type</p>
              </Label>
              <div className="flex gap-2">
                {recurringTypes
                  .filter((type) => type.value !== -1)
                  .map((type) => (
                    <Button
                      key={type.value}
                      value={type.value}
                      onClick={() => setExperienceRecurringType(type.value)}
                      className="w-1/3"
                      variant={
                        experienceRecurringType === type.value
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {type.label}
                    </Button>
                  ))}
              </div>
            </div>
            <div className="mb-4">
              <Label>
                <p className="mb-4">Recurring Value</p>
              </Label>
              {experienceRecurringType === 2 && (
                <div className="flex gap-2">
                  {daysOfWeek.map((day) =>
                    experienceDayOfWeek === undefined ? null : (
                      <Button
                        key={day.value}
                        onClick={() => handleButtonClick(day.value)}
                        variant={
                          experienceDayOfWeek.includes(day.value)
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {day.label}
                      </Button>
                    )
                  )}
                </div>
              )}
              {experienceRecurringType === 1 && (
                <div className="flex gap-2">
                  <Button
                    className="w-full"
                    onClick={() => setExperienceRecurringValue(1)}
                    variant={
                      experienceRecurringValue === 1 ? 'default' : 'outline'
                    }
                  >
                    {experienceStartDate
                      ? formatDateWithSuffix(experienceStartDate)
                      : formatDateWithSuffix(new Date())}
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setExperienceRecurringValue(2)}
                    variant={
                      experienceRecurringValue === 2 ? 'default' : 'outline'
                    }
                  >
                    {experienceStartDate
                      ? formatNthDayOfWeek(experienceStartDate)
                      : formatNthDayOfWeek(new Date())}
                  </Button>
                </div>
              )}
              {experienceRecurringType === 0 && (
                <>
                  <Button className="w-full">
                    {experienceStartDate
                      ? formatDateWithSuffix(experienceStartDate)
                      : formatDateWithSuffix(new Date())}
                  </Button>
                </>
              )}
            </div>
            <>
              <Label>
                <p className="mb-4">Service Options</p>
              </Label>
              {/* Service Option */}
              {experienceRecurringType === 2 ? (
                <div className="">
                  {Object.keys(widgetSettingsData)
                    .filter((dayKey) =>
                      experienceDayOfWeek.includes(Number(dayKey))
                    )
                    .map((dayKey) => {
                      const dayData = widgetSettingsData[Number(dayKey)];
                      if (
                        experienceDayOfWeek === undefined ||
                        !dayData.fetchedData ||
                        dayData.fetchedData.length === 0
                      ) {
                        return null;
                      }
                      return (
                        <div className="mb-2" key={dayKey}>
                          <p className="mb-2 text-sm text-muted-foreground">
                            {dayData.name}
                          </p>
                          <div className="flex gap-2">
                            {dayData.fetchedData.map((service: any) => {
                              if (service.length === 0) {
                                return null;
                              }
                              return (
                                <Button
                                  key={service.service.id}
                                  className="w-full"
                                  onClick={() => handleAddService(service)}
                                  variant={
                                    Array.isArray(experienceWidgetServiceIds) &&
                                    experienceWidgetServiceIds.includes(
                                      service.service.id
                                    )
                                      ? 'default'
                                      : 'outline'
                                  }
                                >
                                  {service.service.service_name}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : experienceRecurringValue === 2 &&
                experienceRecurringType === 1 ? (
                <div className="">
                  {Object.keys(widgetSettingsData)
                    .filter((dayKey) => {
                      const parsedStartDate =
                        typeof experienceStartDate === 'string'
                          ? new Date(experienceStartDate)
                          : experienceStartDate;
                      const currentDate = new Date();
                      if (
                        (experienceDayOfWeek === undefined ||
                          experienceDayOfWeek.length === 0) &&
                        currentDate instanceof Date &&
                        !isNaN(currentDate.getTime())
                      ) {
                        const todayDay =
                          currentDate.getDay() === 0 ? 7 : currentDate.getDay();
                        return Number(dayKey) === todayDay;
                      } else if (
                        parsedStartDate instanceof Date &&
                        !isNaN(parsedStartDate.getTime())
                      ) {
                        const adjustedDay =
                          parsedStartDate.getDay() === 0
                            ? 7
                            : parsedStartDate.getDay();
                        return Number(dayKey) === adjustedDay;
                      }
                      return false;
                    })
                    .map((dayKey) => {
                      const dayData = widgetSettingsData[Number(dayKey)];
                      if (
                        experienceDayOfWeek === undefined ||
                        !dayData.fetchedData ||
                        dayData.fetchedData.length === 0
                      ) {
                        return null;
                      }
                      return (
                        <div className="mb-2" key={dayKey}>
                          <p className="mb-2 text-sm text-muted-foreground">
                            {dayData.name}
                          </p>
                          <div className="flex gap-2">
                            {dayData.fetchedData.map((service: any) => {
                              if (service.length === 0) {
                                return null;
                              }
                              return (
                                <Button
                                  key={service.service.id}
                                  className="w-full"
                                  onClick={() => handleAddService(service)}
                                  variant={
                                    Array.isArray(experienceWidgetServiceIds) &&
                                    experienceWidgetServiceIds.includes(
                                      service.service.id
                                    )
                                      ? 'default'
                                      : 'outline'
                                  }
                                >
                                  {service.service.service_name}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="">
                  {Object.keys(widgetSettingsData).map((dayKey) => {
                    const dayData = widgetSettingsData[Number(dayKey)];
                    if (
                      experienceDayOfWeek === undefined ||
                      !dayData.fetchedData ||
                      dayData.fetchedData.length === 0
                    ) {
                      return null;
                    }
                    return (
                      <div className="mb-2" key={dayKey}>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {dayData.name}
                        </p>
                        <div className="flex gap-2">
                          {dayData.fetchedData.map((service: any) => {
                            if (service.length === 0) {
                              return null;
                            }
                            return (
                              <Button
                                key={service.service.id}
                                className="w-full"
                                onClick={() => handleAddService(service)}
                                variant={
                                  Array.isArray(experienceWidgetServiceIds) &&
                                  experienceWidgetServiceIds.includes(
                                    service.service.id
                                  )
                                    ? 'default'
                                    : 'outline'
                                }
                              >
                                {service.service.service_name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
export default ExperienceField;
