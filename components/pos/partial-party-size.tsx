import React from 'react';
import PartySizeSelection from '@/components/pos/party-size-selection';
import { Modal } from '../ui/modal';

interface PartialPartySizeProps {
  openPartialPartySize: boolean;
  handleCloseSelectedBookingCalendar: (value: boolean) => void;
  partyPartySizeHandler: (value: number) => void;
}
function PartialPartySize({
  openPartialPartySize,
  handleCloseSelectedBookingCalendar,
  partyPartySizeHandler
}: PartialPartySizeProps) {
  const handleSelectedPartySize = (value: any) => {
    partyPartySizeHandler(value);
    handleCloseSelectedBookingCalendar(false);
  };

  return (
    <Modal
      isOpen={openPartialPartySize}
      onClose={() => handleCloseSelectedBookingCalendar(false)}
      title="PARTIAL PARTY SEATED"
      description="Please select the number of guests seated"
    >
      <div className="max-w-[460px] overflow-x-auto">
        <PartySizeSelection
          handleSelectedPartySize={handleSelectedPartySize}
          partySize={12}
          propSelectedPartySize={null}
        />
      </div>
    </Modal>
  );
}

export default PartialPartySize;
