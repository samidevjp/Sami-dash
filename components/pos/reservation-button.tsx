import React from 'react';
import { BOOKINGSTATUS } from '@/utils/enum';
interface ReservationButtonProps {
  selectedBookingStatus: any;
  onClickHandler: any;
}
const ReservationButton: React.FC<ReservationButtonProps> = ({
  selectedBookingStatus,
  onClickHandler
}) => {
  return (
    <div
      onClick={() => onClickHandler(selectedBookingStatus)}
      className={`${
        selectedBookingStatus.value === BOOKINGSTATUS.seated
          ? 'reservation-btn-control--seated'
          : selectedBookingStatus.value === BOOKINGSTATUS.upcoming
          ? 'reservation-btn-control--revert'
          : selectedBookingStatus.value === BOOKINGSTATUS.finished
          ? 'reservation-btn-control--finished'
          : ''
      } reservation-btn-control user-select-none inline-flex h-12 w-full cursor-pointer flex-wrap items-center justify-center rounded border border-border bg-secondary font-medium`}
    >
      {selectedBookingStatus.title}
    </div>
  );
};
export default ReservationButton;
