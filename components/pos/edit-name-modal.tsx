import React, { useEffect, useState } from 'react';
import { Modal, TextField } from '@mui/material';
import { X } from 'lucide-react';
import Image from 'next/image';

interface EditNameModalProps {
  guest: any;
  openEditName: boolean;
  handleCloseEditName: any;
  personIcon: any;
  modalTitle: string;
}

const EditNameModal: React.FC<EditNameModalProps> = ({
  guest,
  openEditName,
  handleCloseEditName,
  personIcon,
  modalTitle
}) => {
  const [guestName, setGuestName] = useState(guest);
  const closeEditName = () => {
    handleCloseEditName(guestName);
  };

  const handleOnChange = (value: string, type: number) => {
    if (type === 1) {
      setGuestName({ ...guestName, first_name: value });
    } else {
      setGuestName({ ...guestName, last_name: value });
    }
  };

  useEffect(() => {
    setGuestName(guest);
  }, [guest]);

  return (
    <Modal
      className="flex items-center justify-center"
      open={openEditName}
      closeAfterTransition
    >
      <div className="flex h-full w-full items-center justify-center bg-black bg-opacity-60 p-3 outline-none backdrop-blur-lg backdrop-filter">
        <div className="flex flex-col items-center rounded-lg bg-white p-5">
          <div className="cursor-pointer" onClick={closeEditName}>
            <X width={12} height={12} />
          </div>
          <p>
            <Image
              src={personIcon}
              width="26"
              height="26"
              alt="Icon"
              className="my-2 mr-2"
            />
            {modalTitle}
          </p>

          <TextField
            label="First Name"
            value={guestName?.first_name}
            onChange={(e) => handleOnChange(e.target.value, 1)}
            placeholder="Enter text here"
            variant="outlined"
            fullWidth
            className="my-2 w-full"
          />
          <div className="my-2 w-full border-b border-gray" />
          <TextField
            label="Last Name"
            value={guestName?.last_name}
            onChange={(e) => handleOnChange(e.target.value, 2)}
            placeholder="Enter text here"
            variant="outlined"
            fullWidth
            className="my-2 w-full"
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditNameModal;
