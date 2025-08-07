import React, { useState, useEffect } from 'react';
import { filterTableByFloor } from '@/utils/Utility';

// Components
import TableFilter from '@/components/pos/table-filter';
import PartySizeSelection from '@/components/pos/party-size-selection';
// import TableList from '@/components/pos/table-list';
import BookingButton from '@/components/pos/booking-button';

import moment from 'moment';
import { useApi } from '@/hooks/useApi';
import { Modal } from '../ui/modal';

interface EditPartySizeTableModalProps {
  partySizeOpen: boolean;
  editPartySizeTableHandle: (partySize: number, selectedTables: any) => void;
  handleCloseEditPartySize: (open: boolean) => void;
  propPartySize: number;
  startTime: any;
  startDate: Date;
  propSelectedTables: any;
  floor: any;
}

const EditPartySizeTableModal: React.FC<EditPartySizeTableModalProps> = ({
  partySizeOpen,
  editPartySizeTableHandle,
  handleCloseEditPartySize,
  propPartySize,
  startTime,
  startDate,
  propSelectedTables,
  floor
}) => {
  const [partySize, setPartySize] = useState(propPartySize);
  const [tableList, setTableList] = useState(null);
  const [tablesData, setTablesData] = useState([]);
  const [toFilterFloor, setToFilterFloor] = useState(floor[0]);
  const [isSuggested, setIsSuggested] = useState(false);
  const [showAllTables, setShowAllTables] = useState(false);
  const [selectedTables, setSelectedtables] = useState(propSelectedTables);

  const { searchTables } = useApi();

  let _floor = floor[0];

  const closeEditPartySize = () => {
    editPartySizeTableHandle(partySize, selectedTables);
    handleCloseEditPartySize(false);
  };

  const handleSelectFloor = (floor: any) => {
    _floor = floor;
    setToFilterFloor(floor);
    setTableList(filterTableByFloor(floor.id, tablesData));
  };

  const handleSelectedPartySize = (value: any) => {
    setPartySize(value);
  };

  const setIsSuggestedHandler = () => {
    setIsSuggested(!isSuggested);
  };

  const setShowAllTablesHandler = () => {
    setShowAllTables(!showAllTables);
  };
  useEffect(() => {
    handleSearchTables();
  }, [showAllTables, isSuggested, partySize]);

  const [isTableSearching, setIsTableSearching] = useState(false);
  // Search Tables
  const handleSearchTables = async () => {
    if (partySize === 0 || startTime === 0) {
      return;
    }
    setIsTableSearching(true);
    try {
      let param = {};
      param = {
        party_size: partySize,
        booking_time: startTime,
        booking_date: moment(startDate).format('yyyy-MM-DD'),
        show_suggested: isSuggested,
        show_all: showAllTables
      };

      const tables = await searchTables(param);
      if (tables) {
        setTablesData(tables);
        setTableList(
          filterTableByFloor(
            toFilterFloor === undefined ? _floor.id : toFilterFloor.id,
            tables
          )
        );
      }
    } catch (err) {
      console.log('Error: ', err);
    }
    setIsTableSearching(false);
  };

  useEffect(() => {
    if (partySize && startTime && selectedTables) {
      handleSearchTables();
    }
  }, []);

  return (
    <Modal
      title="Edit Party Size/Table"
      description=""
      isOpen={partySizeOpen}
      onClose={closeEditPartySize}
    >
      <div>
        <div className="editPartySize-content-container w-[468px]">
          <div className="p-1">
            <PartySizeSelection
              handleSelectedPartySize={handleSelectedPartySize}
              partySize={12}
              propSelectedPartySize={partySize}
            />
          </div>
          {/* <div className="mt-4 flex justify-between">
            <TableFilter handleSelectFloor={handleSelectFloor} floor={floor} />
            <div className="flex justify-end gap-2">
              <BookingButton
                titleName="Suggested"
                isSelectedHandler={setIsSuggestedHandler}
                propIsSelected={isSuggested}
              />
              <BookingButton
                titleName="Show all tables"
                isSelectedHandler={setShowAllTablesHandler}
                propIsSelected={showAllTables}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <TableList
              isMultipleTable={true}
              selectedTables={selectedTables}
              tables={tableList}
              floors={floor}
              setSelectedTables={setSelectedtables}
              isLoading={isTableSearching}
            />
          </div> */}
        </div>
      </div>
    </Modal>
  );
};

export default EditPartySizeTableModal;
