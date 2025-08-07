import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { User, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useApi } from '@/hooks/useApi';

interface SettingSecondaryPanelsProps {
  largeParties: number;
  isLateArrivals: boolean;
  isEnableCreditCardDetails: boolean;
  widgetNoteTitle: string;
  setWidgetNoteTitle: React.Dispatch<React.SetStateAction<string>>;
  widgetNoteMessage: string;
  setWidgetNoteMessage: React.Dispatch<React.SetStateAction<string>>;
  isAllowRequest: boolean;
  setIsAllowRequest: React.Dispatch<React.SetStateAction<boolean>>;
  isEmailRequest: boolean;
  setIsEmailRequest: React.Dispatch<React.SetStateAction<boolean>>;
  emailSubject: string;
  setEmailSubject: React.Dispatch<React.SetStateAction<string>>;
  emailText: string;
  setEmailText: React.Dispatch<React.SetStateAction<string>>;
  isAllowRequestCancel: boolean;
  setIsAllowRequestCancel: React.Dispatch<React.SetStateAction<boolean>>;
  cancellationDuration: number;
  setCancellationDuration: React.Dispatch<React.SetStateAction<number>>;
  isOnlineAvailability: boolean;
  setIsOnlineAvailability: React.Dispatch<React.SetStateAction<boolean>>;
  minimumPartySize: number;
  setMinimumPartySize: React.Dispatch<React.SetStateAction<number>>;
  maximumPartySize: number;
  setMaximumPartySize: React.Dispatch<React.SetStateAction<number>>;
  createTurnTimeData: any[];
  setCreateTurnTimeData: React.Dispatch<React.SetStateAction<any[]>>;
  deleteTurnTimeData: number[];
  setDeleteTurnTimeData: React.Dispatch<React.SetStateAction<number[]>>;
  fetchPartysizeTurnTimeWithRetry: () => void;
}
const SettingSecondaryPanels: React.FC<SettingSecondaryPanelsProps> = ({
  largeParties,
  isLateArrivals,
  isEnableCreditCardDetails,
  widgetNoteTitle,
  setWidgetNoteTitle,
  widgetNoteMessage,
  setWidgetNoteMessage,
  isAllowRequest,
  setIsAllowRequest,
  isEmailRequest,
  setIsEmailRequest,
  emailSubject,
  setEmailSubject,
  emailText,
  setEmailText,
  isAllowRequestCancel,
  setIsAllowRequestCancel,
  cancellationDuration,
  setCancellationDuration,
  isOnlineAvailability,
  setIsOnlineAvailability,
  minimumPartySize,
  setMinimumPartySize,
  maximumPartySize,
  setMaximumPartySize,
  createTurnTimeData,
  setCreateTurnTimeData,
  deleteTurnTimeData,
  setDeleteTurnTimeData,
  fetchPartysizeTurnTimeWithRetry
}) => {
  useEffect(() => {
    if (isAllowRequest === false) {
      setIsEmailRequest(false);
    }
  }, [isAllowRequest]);
  return (
    <div>
      {/* Custom Widget Note */}
      <div className="border-b pb-6">
        <div className="mb-2 flex items-center gap-2">
          <p className="text-base font-semibold">Custom Widget Note</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Info size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Use these fields to customize the title and message that will be
                shown on the widget when a reservation is made.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="ml-8">
          <Label className="text-sm text-muted-foreground">Subject</Label>
          <Input
            value={widgetNoteTitle}
            onChange={(e) => setWidgetNoteTitle(e.target.value)}
            className="mb-4"
          />
          <Label className="text-sm text-muted-foreground">Message</Label>
          <Textarea
            value={widgetNoteMessage}
            onChange={(e) => setWidgetNoteMessage(e.target.value)}
            rows={4}
          />
        </div>
      </div>
      {/* Allow a customer to send the request for their reservation */}
      <div className="border-b pb-6 pt-6">
        <Label className="mb-4 flex cursor-pointer items-center justify-between">
          <span className="text-base font-semibold">
            Allow a customer to send the request for their reservation
          </span>
          <Switch
            checked={isAllowRequest}
            onCheckedChange={() => setIsAllowRequest(!isAllowRequest)}
          />
        </Label>
        <div className="ml-8">
          <div
            className={`${
              !isAllowRequest ? 'cursor-not-allowed text-gray-400' : ''
            }`}
          >
            <Label className="mb-4 flex cursor-pointer items-center justify-between">
              <span className="text-base font-semibold">
                Allow automatically sent email
              </span>
              <Switch
                checked={isEmailRequest}
                onCheckedChange={() => setIsEmailRequest(!isEmailRequest)}
              />
            </Label>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <p
              className={`${
                !isEmailRequest || !isAllowRequest
                  ? 'cursor-not-allowed text-gray-400'
                  : ''
              }`}
            >
              Custom the automatic reply email when a request is made
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-not-allowed">
                    <Info size={16} className="text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Use these fields to customize the title and message that will
                  be shown on the automatic reply email when a request is made.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Label
            className={`${
              !isEmailRequest || !isAllowRequest
                ? 'text-sm text-gray-400'
                : 'text-sm text-muted-foreground'
            }`}
          >
            Subject
          </Label>
          <Input
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="mb-4"
            disabled={!isEmailRequest || !isAllowRequest}
          />
          <Label
            className={`${
              !isEmailRequest || !isAllowRequest
                ? 'text-sm text-gray-400'
                : 'text-sm text-muted-foreground'
            }`}
          >
            Message
          </Label>
          <Textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            rows={6}
            disabled={!isEmailRequest || !isAllowRequest}
          />
        </div>
      </div>
      {/* Allow a customer to Request cancel their reservation */}
      <div className="border-b py-12">
        <Label className="mb-4 flex cursor-pointer items-center justify-between">
          <span className="text-base font-semibold">
            Allow a customer to Request cancel their reservation
          </span>
          <Switch
            checked={isAllowRequestCancel}
            onCheckedChange={() =>
              setIsAllowRequestCancel(!isAllowRequestCancel)
            }
          />
        </Label>
        <div
          className={`ml-8 transition-opacity duration-300 ${
            isAllowRequestCancel ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <Label>
            <p className="mb-2 text-sm">
              Select how long a customer has before they can cancel
            </p>
            <Select
              value={(cancellationDuration / 60).toString()}
              onValueChange={(value) => {
                setCancellationDuration(parseInt(value) * 60);
              }}
              disabled={!isAllowRequestCancel}
            >
              <SelectTrigger className="mx-2 sm:w-1/2">
                <SelectValue>
                  {cancellationDuration === 0
                    ? 'Select'
                    : `${cancellationDuration / 60} minutes`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Select</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </Label>
        </div>
      </div>
      {/* Online Availability */}
      <div className="py-6">
        <Label className="mb-4 flex cursor-pointer items-center justify-between">
          <span className="text-base font-semibold">Online Availability</span>
          <Switch
            checked={isOnlineAvailability}
            onCheckedChange={() =>
              setIsOnlineAvailability(!isOnlineAvailability)
            }
          />
        </Label>
        <div
          className={`ml-8 transition-opacity duration-300 ${
            isOnlineAvailability ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <p className="mb-4 text-sm md:mb-2">
            Customize the minimum and maximum party sizes you want to offer on
            WABI for every shift and special day.
          </p>
          <div className="max-w-[240px] items-center gap-8 md:flex md:max-w-none">
            {/* Minimum party size */}
            <div className="mb-2 flex items-center gap-2 border-b md:mb-0">
              <User name="user" className="h-6 w-6" />
              <Input
                type="number"
                min="1"
                className={`w-40 border-none text-center focus:outline-none ${
                  !isOnlineAvailability ? 'cursor-not-allowed' : ''
                }`}
                value={minimumPartySize}
                onChange={(e) => setMinimumPartySize(parseInt(e.target.value))}
                disabled={!isOnlineAvailability}
              />
            </div>
            {/* Maximum party size */}
            <div className="flex items-center gap-2 border-b">
              <Users name="users" className="h-6 w-6" />
              <Input
                type="number"
                min="1"
                className={`w-40 border-none text-center focus:outline-none ${
                  !isOnlineAvailability ? 'cursor-not-allowed' : ''
                }`}
                value={maximumPartySize}
                onChange={(e) => setMaximumPartySize(parseInt(e.target.value))}
                disabled={!isOnlineAvailability}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingSecondaryPanels;
