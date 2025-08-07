import React, { useState } from 'react';
import { getTimeStr } from '@/utils/Utility';
import { Modal } from '../ui/modal';
interface EditBookingTimeModalProps {
  bookingTimeOpen: any;
  setBookingTimeOpen: any;
  selectedTimeHandler: any;
  timeList: any;
  btnTimelineIcon: any;
}

const EditBookingTimeModal: React.FC<EditBookingTimeModalProps> = ({
  bookingTimeOpen,
  setBookingTimeOpen,
  selectedTimeHandler,
  timeList,
  btnTimelineIcon
}) => {
  const [selectedTime, setSelectedTime] = useState(null);

  const handleOpenEditTimeBooking = bookingTimeOpen ? bookingTimeOpen : false;

  const selectTime = (time: any) => {
    setSelectedTime(time);
    selectedTimeHandler(time);
    setBookingTimeOpen(false);
  };

  return (
    <Modal
      isOpen={handleOpenEditTimeBooking}
      title="Edit Booking Time"
      description=""
      onClose={() => setBookingTimeOpen(false)}
    >
      {/* <div className="img-wrapper" onClick={() => setBookingTimeOpen()}>
                <X width={20} height={20} />
              </div> */}
      {/* <label
                style={{
                  fon</div>tSize: 16,
                  fontWeight: 'bold',
                  color: 'white',
                  display: 'inline-flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '17px'
                }}
              >
                <Image
                  src={btnTimelineIcon}
                  width="26"
                  height="26"
                  alt="Icon"
                  className="m-3"
                />
                {modalTitle}
              </label> */}
      <div className="scrollable-container h-72 overflow-auto">
        <div className="list-item-container grid grid-flow-row grid-cols-3 gap-y-2">
          {timeList.length > 0
            ? timeList.map((time: any) => {
                return (
                  <div
                    key={Math.random()}
                    onClick={() => selectTime(time)}
                    className={`
                      ${
                        selectedTime === time
                          ? 'border border-primary bg-tertiary'
                          : 'bg-secondary'
                      }
                    w-32 cursor-pointer rounded-lg px-4 py-2 text-center`}
                  >
                    {getTimeStr(time)}
                  </div>
                );
              })
            : ''}
        </div>
      </div>
    </Modal>
  );
};
export default EditBookingTimeModal;
