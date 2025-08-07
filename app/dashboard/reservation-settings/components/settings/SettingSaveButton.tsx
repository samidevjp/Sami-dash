import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';

interface SettingSaveButtonProps {
  largeParties: number;
  isLateArrivals: boolean;
  isEnableCreditCardDetails: boolean;
  widgetNoteTitle: string;
  widgetNoteMessage: string;
  isAllowRequest: boolean;
  isEmailRequest: boolean;
  emailSubject: string;
  emailText: string;
  isAllowRequestCancel: boolean;
  cancellationDuration: number;
  isOnlineAvailability: boolean;
  minimumPartySize: number;
  maximumPartySize: number;
  createTurnTimeData: any[];
  setCreateTurnTimeData: React.Dispatch<React.SetStateAction<any[]>>;
  deleteTurnTimeData: number[];
  setDeleteTurnTimeData: React.Dispatch<React.SetStateAction<number[]>>;
  fetchPartysizeTurnTimeWithRetry: () => void;
}

const SettingSaveButton: React.FC<SettingSaveButtonProps> = ({
  largeParties,
  isLateArrivals,
  isEnableCreditCardDetails,
  widgetNoteTitle,

  widgetNoteMessage,

  isAllowRequest,

  isEmailRequest,

  emailSubject,

  emailText,

  isAllowRequestCancel,

  cancellationDuration,

  isOnlineAvailability,

  minimumPartySize,

  maximumPartySize,

  createTurnTimeData,
  setCreateTurnTimeData,
  deleteTurnTimeData,
  setDeleteTurnTimeData,
  fetchPartysizeTurnTimeWithRetry
}) => {
  const { setAccountSettings, setCustomTurnTime, deleteCustomTurnTime } =
    useApi();
  const [isSaving, setIsSaving] = useState(false);
  // Save
  const sendTurnTimeParamsSequentially = async () => {
    try {
      for (const item of createTurnTimeData) {
        const isNewItem = item.is_new;
        const turnTimeParam = {
          id: isNewItem ? 0 : item.id,
          active: item.active,
          turn_time: item.turn_time,
          party_size: item.party_size
        };
        const response = await setCustomTurnTime(turnTimeParam);
        console.log(response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendDeleteTurnTimeParamsSequentially = async () => {
    try {
      for (const id of deleteTurnTimeData) {
        const params = {
          id: id
        };
        const response = await deleteCustomTurnTime(params);
        console.log(response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlesSave = async () => {
    try {
      setIsSaving(true);

      await setAccountSettings({
        late_arrivals: isLateArrivals,
        online_available_booking_min: minimumPartySize,
        online_available_booking_max: maximumPartySize,
        widget_note_title: widgetNoteTitle,
        widget_note_message: widgetNoteMessage,
        large_party_count: largeParties,
        online_booking_payment: isEnableCreditCardDetails,
        allow_guest_request: isAllowRequest,
        allow_automatically_sent_email: isEmailRequest,
        email_subject: emailSubject,
        email_text: emailText,
        allow_guest_request_cancel_reservation: isAllowRequestCancel,
        allow_guest_request_cancel_reservation_duration: cancellationDuration,
        online_available: isOnlineAvailability
      });

      if (createTurnTimeData.length > 0) {
        await sendTurnTimeParamsSequentially();
      }

      if (deleteTurnTimeData.length > 0) {
        await sendDeleteTurnTimeParamsSequentially();
      }

      fetchPartysizeTurnTimeWithRetry();

      toast({
        title: 'Settings Saved',
        description: 'Settings have been saved successfully',
        variant: 'success'
      });

      setCreateTurnTimeData([]);
      setDeleteTurnTimeData([]);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="">
      <Button
        className="flex w-40 items-center justify-center gap-2"
        disabled={isSaving}
        onClick={handlesSave}
      >
        Save
      </Button>
    </div>
  );
};

export default SettingSaveButton;
