'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EditEmployeeModal } from './EditEmployeeDetails';
interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}
export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };
  return (
    <>
      <Modal
        description="Employee"
        isOpen={isOpen}
        onClose={onClose}
        title={employee.name}
      >
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="text-center font-bold text-white">
              {employee.name}
            </div>
            <div className="text-center text-gray-400">{employee.role}</div>
            <Button onClick={handleEditClick}>Edit</Button>
          </div>
        </div>
      </Modal>
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={employee}
      />
    </>
  );
};
