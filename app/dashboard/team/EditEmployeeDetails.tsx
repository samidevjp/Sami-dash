'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}
export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  const [step, setStep] = useState(1);
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  return (
    <Modal
      description="Edit Employee"
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Employee"
    >
      <div className="p-4">
        {step === 1 && (
          <div className="flex flex-col space-y-4">
            <Input
              placeholder="First Name"
              defaultValue={employee.name.split(' ')[0]}
            />
            <Input
              placeholder="Last Name"
              defaultValue={employee.name.split(' ')[1]}
            />
            <Button onClick={nextStep}>Next</Button>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col space-y-4">
            <Input placeholder="Tax Number" />
            <Input placeholder="Bank Account" />
            <Button onClick={prevStep}>Back</Button>
            <Button onClick={nextStep}>Next</Button>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col space-y-4">
            <Input placeholder="Monday Pay Rate" />
            <Input placeholder="Tuesday Pay Rate" />
            <Button onClick={prevStep}>Back</Button>
            <Button onClick={onClose}>Save</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
