import React, { use, useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Modal } from '../ui/modal';
import { toast } from '../ui/use-toast';

const CustomTextField = ({ label, value, onChange }: any) => (
  <div className="mb-2 flex w-full items-center border-t border-border p-6">
    <p className="min-w-[36%] text-sm ">{label}</p>
    <Input
      placeholder={label}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-border"
    />
  </div>
);

interface AddNewGuestModalProps {
  addGuestModal: boolean;
  setAddGuestModal: (isOpen: boolean) => void;
  openAllGuestsModal: () => void;
}

const AddNewGuestModal: React.FC<AddNewGuestModalProps> = ({
  addGuestModal,
  setAddGuestModal,
  openAllGuestsModal
}) => {
  const [guestPhoto, setGuestPhoto] = useState<any>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const { addGuest, uploadGuestPhoto } = useApi();

  useEffect(() => {
    if (firstName && lastName) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [firstName, lastName]);
  const handleAddGuest = async () => {
    const params = {
      card_brand: '',
      company: company,
      string_tags: [],
      city: '',
      card_exp: '',
      general_note: '',
      first_name: firstName,
      card_last_4: '',
      email: email,
      address: '',
      last_name: lastName,
      anniversary: '',
      phone: phone,
      birthdate: '',
      tags: [],
      id: 0,
      food_drink_preference: '',
      special_relationship: '',
      seating_preference: '',
      state: '',
      postal: '',
      photo: ''
    };
    try {
      const response = await addGuest(params);
      if (guestPhoto) {
        await uploadGuestPhoto({
          id: response.guest.id,
          image: guestPhoto.name,
          photo: guestPhoto
        });
      }
      openAllGuestsModal();
      setAddGuestModal(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `An error occurred while adding guest`,
        variant: 'destructive',
        duration: 5000
      });
    }
  };
  return (
    <Modal
      isOpen={addGuestModal}
      title="Add New Guest"
      description=""
      onClose={() => setAddGuestModal(false)}
    >
      <div className=" h-full max-h-[80vh] justify-center overflow-auto">
        <div className="mb-4 flex flex-col items-center gap-4">
          {guestPhoto ? (
            <Image
              src={URL.createObjectURL(guestPhoto)}
              width="200"
              height="200"
              alt="guest photo"
              className="rounded-lg"
            />
          ) : (
            <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-gray-200">
              <p className="text-center text-black">No photo uploaded</p>
            </div>
          )}
          <Input
            type="file"
            onChange={(e) => {
              setGuestPhoto(e.target?.files?.[0]);
            }}
          />
        </div>
        <CustomTextField
          label="First Name"
          value={firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFirstName(e.target.value)
          }
        />
        <CustomTextField
          label="Last Name"
          value={lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLastName(e.target.value)
          }
        />
        <CustomTextField
          label="Company"
          value={company}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCompany(e.target.value)
          }
        />
        <CustomTextField
          label="Phone Number"
          value={phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPhone(e.target.value)
          }
        />
        <CustomTextField
          label="Email Address"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
        <div className="flex justify-end pb-1">
          <Button disabled={isDisabled} onClick={handleAddGuest}>
            Add Guest
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddNewGuestModal;
