import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GuestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guestInfo: any) => void;
  initialGuestInfo: any;
}

const GuestInfoModal: React.FC<GuestInfoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGuestInfo
}) => {
  const [guestInfo, setGuestInfo] = useState(initialGuestInfo);

  useEffect(() => {
    setGuestInfo(initialGuestInfo);
  }, [initialGuestInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(guestInfo);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Guest Information"
      description=""
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="first_name"
          value={guestInfo?.first_name || ''}
          onChange={handleChange}
          placeholder="First Name"
        />
        <Input
          name="last_name"
          value={guestInfo?.last_name || ''}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <Input
          name="phone"
          value={guestInfo?.phone || ''}
          onChange={handleChange}
          placeholder="Mobile Number"
        />
        <Input
          name="email"
          value={guestInfo?.email || ''}
          onChange={handleChange}
          placeholder="Email"
        />
        <div className="flex justify-end">
          <Button variant="submit" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GuestInfoModal;
