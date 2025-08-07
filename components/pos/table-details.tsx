import React, { useState } from 'react';
import {
  getTimeOnly,
  getFullname,
  getGuestPhoneNum,
  getTableSize,
  getFloorName
} from '@/utils/Utility';
import { BOOKINGSTATUS, BOOKINGTYPE } from '@/utils/enum';
import { NumericFormat } from 'react-number-format';
// Icons
import billedIcon from '@/public/images/booking/left-panel-menu/billed-icon.png';
import wabiIcon from '@/public/wabiIcon.png';
import experienceIcon from '@/public/images/booking/left-panel-menu/booking-option-experience-icon.png';
import phoneIcon from '@/public/images/booking/left-panel-menu/booking-status-phone.png';
import TimeGraph from '@/components/pos/time-graph';

import { useApi } from '@/hooks/useApi';
import { X, NotepadText } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { responseOK } from '@/lib/utils';
import { toast } from '../ui/use-toast';

interface TableDetailsProps {
  updateData: () => void;
  floors: any[];
  setIsBookingModalOpen: (flag: boolean) => void;
  isChangingTable: boolean;
  saveBookingHandler: () => void;
  selectedBooking: any;
  selectedBookingHandler: any;
  selectedShiftId: number | undefined;
  selectedTableBookingData: any;
  selectedTableIds: number[];
  setIsChangingTable: any;
  setSelectedTableIds: (tableIds: number[]) => void;
  setShowTableDetails: any;
  showTableDetails: boolean;
  showTableDetailsHandler: any;
  tableDetailsData: any;
  allShifts: any;
  handleCreateWalkInBooking: any;
}

const TableDetails: React.FC<TableDetailsProps> = ({
  updateData,
  floors,
  setIsBookingModalOpen,
  isChangingTable,
  saveBookingHandler,
  selectedBooking,
  selectedBookingHandler,
  selectedShiftId,
  selectedTableBookingData,
  selectedTableIds,
  setIsChangingTable,
  setSelectedTableIds,
  setShowTableDetails,
  showTableDetails,
  showTableDetailsHandler,
  tableDetailsData,
  allShifts,
  handleCreateWalkInBooking
}) => {
  const { updateBooking } = useApi();
  const [isSaving, setIsSaving] = useState(false);

  const toggleShow = (booking: any) => {
    if (selectedBookingHandler) {
      if (!selectedBooking) {
        selectedBookingHandler(booking);
      } else if (selectedBooking.id === booking.id) {
        selectedBookingHandler(null);
      } else {
        selectedBookingHandler(booking);
      }
    }
  };

  const changeTableHandler = () => {
    if (isChangingTable) {
      setIsChangingTable(!isChangingTable);
    } else {
      let table_ids = selectedBooking.table.map((e: any) => e.id);
      setSelectedTableIds(table_ids);
      setIsChangingTable(!isChangingTable);
    }
  };

  const changeTableSubmit = (item: any) => {
    let booking = selectedBooking;
    if (!booking.table_ids) {
      booking['table_ids'] = booking.table.map((e: any) => e.id);
    }

    booking = {
      ...booking,
      table_ids: item.length > 0 ? item : booking.table_ids
    };

    handleUpdateBooking(booking);
  };

  const toggleCancel = () => {
    if (!isSaving) {
      setIsChangingTable(false);
      setSelectedTableIds([]);
    }
  };

  const handleUpdateBooking = async (booking: any) => {
    if (!isSaving) {
      setIsSaving(true);
      try {
        const response = await updateBooking(booking);
        if (responseOK(response)) {
          toast({
            title: 'Success',
            description: 'Booking updated successfully.',
            duration: 3000
          });
        }
        saveBookingHandler();
        setShowTableDetails(false);
        selectedBookingHandler(null);
        setIsChangingTable(false);
        setSelectedTableIds([]);
      } catch (error) {
        console.error(error);
      }
      setIsSaving(false);
      updateData();
    }
  };

  // Utility Component
  const Icon = ({ src, alt }: any) => (
    <Image src={src} width="18" height="18" alt={alt} />
  );
  return (
    <div
      className={`table-details-container transition-left absolute top-0 z-10 h-full w-full select-none overflow-hidden rounded-lg bg-tertiary duration-200 ease-in-out ${
        showTableDetails ? 'left-0' : '-left-full'
      }`}
    >
      <div
        className="absolute right-2 top-2 cursor-pointer"
        onClick={showTableDetailsHandler}
      >
        <X />
      </div>
      <div className="col1 flex p-2">
        <div className="flex items-center">
          <div
            className={
              selectedTableBookingData.some((e: any) => e.status === 4)
                ? 'dot dot--seated'
                : 'dot'
            }
          />
          <p className="tableDetails-table-name ml-2">
            {selectedTableBookingData.length > 0
              ? selectedTableBookingData[0].table[0].name
              : tableDetailsData?.name}
          </p>
        </div>
      </div>

      <div className="p-0">
        <div className="graph-wrapper block bg-secondary p-4">
          <p>SCHEDULE</p>
          <TimeGraph
            selectedShiftId={selectedShiftId}
            allShifts={allShifts}
            bookingsOnTable={selectedTableBookingData}
          />
        </div>
      </div>

      <div
        className={`tableDetail-contentWrapper h-72 overflow-y-auto ${
          isChangingTable ? 'pointer-events-none' : ''
        }`}
      >
        {selectedTableBookingData.length > 0 ? (
          <ul className="mt-2">
            {selectedTableBookingData.map((item: any, key: number) => (
              <li
                key={key}
                className={`cursor-pointer bg-transparent p-2 transition-all duration-300 hover:bg-muted/60 
                  ${selectedBooking?.id === item.id ? ' bg-muted/60' : ''}
                `}
                onClick={() => toggleShow(item)}
              >
                <div className="relative flex w-full gap-2">
                  <div className="timeDisplay mt-1 h-14 w-14 rounded bg-reservationIcon p-2 text-center text-sm font-bold">
                    <p>{getTimeOnly(item.start_date)}</p>
                  </div>

                  <div className="cxInfo flex flex-col pl-2">
                    <p className="min-w-44 max-w-44 font-medium">
                      {getFullname(item.guest)}
                    </p>
                    <NumericFormat
                      value={getGuestPhoneNum(item.guest)}
                      displayType={'text'}
                      className="span-no mt-1 text-xs"
                    />
                    <p className="text-xs">
                      {getTableSize(item) +
                        ' / ' +
                        getFloorName(item.floor_id, floors)}
                    </p>
                  </div>

                  <div className="noteIcon-wrapper absolute -bottom-[2px] -right-1 mt-4 flex p-2">
                    {item.reservation_note && <NotepadText />}
                    {item.status === BOOKINGSTATUS.billed && (
                      <Icon src={billedIcon} alt="billed" />
                    )}
                    {item.type === BOOKINGTYPE.widget && (
                      <Icon src={wabiIcon} alt="widget" />
                    )}
                    {item.type === BOOKINGTYPE.experience && (
                      <Icon src={experienceIcon} alt="experience" />
                    )}
                    {item.type === BOOKINGTYPE.phone && (
                      <Icon src={phoneIcon} alt="phone" />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center"></div>
        )}
      </div>

      <div className="footer absolute flex w-full flex-col">
        {selectedBooking ? (
          <div className="tableDetails-footer mx-2 flex flex-col gap-2">
            {isChangingTable ? (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => changeTableSubmit(selectedTableIds)}
                >
                  Change Assignment
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={toggleCancel}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={changeTableHandler}
              >
                Change Table
              </Button>
            )}
          </div>
        ) : (
          <div className="tableDetails-footer mx-2 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                handleCreateWalkInBooking(selectedTableIds[0]);
              }}
              className="w-full"
            >
              Add Walk-in
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full"
            >
              Make Reservations
            </Button>
            <Button variant="outline" disabled className="w-full">
              Block Table by Time
            </Button>
            <Button variant="outline" disabled className="w-full">
              Block Table Manually
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableDetails;
