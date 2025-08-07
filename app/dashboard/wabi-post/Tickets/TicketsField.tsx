import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import moment from 'moment';
import { TicketFieldProps, TicketOption } from '../types';
import {
  Plus,
  Trash2,
  User2,
  Coins,
  CalendarRange,
  CheckCircle2,
  Tickets
} from 'lucide-react';

const TicketsField: React.FC<TicketFieldProps> = ({
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
  setTicketOptions
}) => {
  const formatDateForInput = (date: Date | null) =>
    date ? moment(date).format('YYYY-MM-DDTHH:mm') : '';

  const handleSliderChange = (value: number[]) => {
    setTotalTickets(value[0]);
  };

  const handleStartSellDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartSellDate(new Date(e.target.value));
  };
  const handleEndSellDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndSellDate(new Date(e.target.value));
  };
  const handleEventDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventDate(new Date(e.target.value));
  };
  const handleExpirationDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpirationDate(new Date(e.target.value));
  };

  const handleAddTicketOption = () => {
    const newOption: TicketOption = {
      id: Date.now().toString(),
      name: '',
      limit: 0,
      price: 0,
      is_active: true,
      validityFrom: '',
      validityTo: '',
      is_new: true
    };
    setTicketOptions([...ticketOptions, newOption]);
  };

  const handleOptionChange = (
    id: string,
    field: keyof TicketOption,
    value: any
  ) => {
    setTicketOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const handleOptionValidityFromChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDate = new Date(e.target.value);
    setTicketOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, validityFrom: newDate } : opt
      )
    );
  };

  const handleOptionValidityToChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDate = new Date(e.target.value);
    setTicketOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, validityTo: newDate } : opt))
    );
  };

  const handleRemoveTicketOption = (id: string) => {
    setTicketOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, is_deleted: 1 } : opt))
    );
  };

  useEffect(() => {
    if (ticketOptions.length === 0) {
      handleAddTicketOption();
    }
  }, []);

  const activeTickets = ticketOptions.filter((opt) => opt.is_deleted !== 1);
  useEffect(() => {
    if (activeTickets.length === 0) {
      handleAddTicketOption();
    }
  }, [activeTickets]);
  return (
    <>
      <Card className="border-none bg-secondary shadow-none">
        <CardHeader className="px-0 py-4">
          <p className="text-lg font-semibold">Ticket Settings</p>
        </CardHeader>
        <CardContent className=" p-0">
          <div className="space-y-6 rounded-md border bg-background p-4 shadow-sm">
            {/* Total Tickets */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Tickets size={16} />
                Total tickets available
              </Label>
              <div className="items-center gap-4 lg:flex">
                <Slider
                  value={[totalTickets]}
                  min={0}
                  max={10000}
                  onValueChange={handleSliderChange}
                  className="flex-1 cursor-pointer"
                  step={1}
                  aria-label="Total Tickets"
                />
                <Input
                  type="number"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(Number(e.target.value))}
                  className="w-24 text-center"
                />
              </div>
            </div>

            {/* Ticket Sales Period */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <CalendarRange size={16} />
                Ticket sales period
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Sales start</Label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(startSellDate)}
                    onChange={handleStartSellDateChange}
                  />
                </div>
                <div>
                  <Label className="text-sm">Sales end</Label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(endSellDate)}
                    onChange={handleEndSellDateChange}
                  />
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <CalendarRange size={16} />
                Event Timing
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start time</Label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(eventDate)}
                    onChange={handleEventDateChange}
                  />
                </div>
                <div>
                  <Label className="text-sm">End time</Label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(expirationDate)}
                    onChange={handleExpirationDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Types */}
      <Card className="mt-4 border-none bg-secondary shadow-none">
        <CardHeader className="px-0 py-4">
          <p className="text-lg font-semibold">Ticket Types</p>
        </CardHeader>
        <CardContent className=" p-0">
          {activeTickets.map((option) => (
            <div
              key={option.id}
              className="relative mb-8 space-y-6 rounded-md border bg-background p-4 shadow-sm"
            >
              {/* Basic Info */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <User2 size={16} /> Basic Info
                </p>
                <Label>Option Name</Label>
                <Input
                  placeholder="Enter ticket or item name"
                  value={option.name}
                  onChange={(e) =>
                    handleOptionChange(option.id, 'name', e.target.value)
                  }
                />
              </div>

              {/* Quantity & Price */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Coins size={16} /> Quantity & Price
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Limit</Label>
                    <Input
                      type="number"
                      value={option.limit}
                      onChange={(e) =>
                        handleOptionChange(
                          option.id,
                          'limit',
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={option.price}
                      onChange={(e) =>
                        handleOptionChange(
                          option.id,
                          'price',
                          Number(e.target.value)
                        )
                      }
                      placeholder="e.g. 39.99"
                    />
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CalendarRange size={16} /> Validity Period
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Valid From</Label>
                    <Input
                      type="datetime-local"
                      value={formatDateForInput(option.validityFrom)}
                      onChange={(e) =>
                        handleOptionValidityFromChange(option.id, e)
                      }
                    />
                  </div>
                  <div>
                    <Label>Valid To</Label>
                    <Input
                      type="datetime-local"
                      value={formatDateForInput(option.validityTo)}
                      onChange={(e) =>
                        handleOptionValidityToChange(option.id, e)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <CheckCircle2 size={16} /> Status
                </p>
                <Label className="flex items-center gap-2">
                  <span>Active</span>
                  <Switch
                    checked={option.is_active}
                    onCheckedChange={(value) =>
                      handleOptionChange(option.id, 'is_active', value)
                    }
                  />
                </Label>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-4 right-4 z-10 text-sm"
                disabled={activeTickets.length === 1}
                onClick={() => handleRemoveTicketOption(option.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}

          <Button
            onClick={handleAddTicketOption}
            className="mx-auto mt-6 flex justify-center"
          >
            <Plus size={20} className="mr-2" />
            Add Ticket Type
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default TicketsField;
