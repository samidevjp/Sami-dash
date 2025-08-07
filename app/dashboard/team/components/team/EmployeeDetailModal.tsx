import React, { useEffect, useState } from 'react';
import ProfileAvatar from '../common/ProfileAvatar';

import Image from 'next/image';
import { Employee } from '@/types';
interface EmployeeDetailModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}
const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  open,
  onClose,
  onEdit
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));
  }, []);
  if (!employee) return null;
  return (
    <div
      className={`fixed inset-0 z-20 flex items-center justify-center backdrop-blur-sm ${
        open ? 'block' : 'hidden'
      }`}
    >
      <div className="z-30 h-auto w-full max-w-xl rounded-lg bg-background p-10 shadow-lg">
        <div className="rounded-lg">
          {/* Sections */}
          <div className="mb-4 flex items-stretch justify-between gap-4">
            {/* Section01 */}
            <div
              className="min-h-[180px] flex-1 cursor-pointer rounded-lg bg-secondary p-4"
              onClick={() => onEdit(employee)}
            >
              <div className="text-right">
                {isDarkMode ? (
                  <Image
                    width={100}
                    height={30}
                    className="logo-dark inline h-full w-12 text-inherit"
                    alt="logo"
                    src="/WhiteLogo.png"
                  />
                ) : (
                  <Image
                    width={100}
                    height={30}
                    className="logo-dark inline h-full w-12 text-inherit"
                    alt="logo"
                    src="/BlackLogo.png"
                  />
                )}
              </div>
              <div className="mb-2 flex items-center">
                <ProfileAvatar
                  profilePicUrl={employee.photo}
                  firstName={employee.first_name}
                  lastName={employee.last_name}
                  color={employee.color}
                  width={90}
                  height={90}
                />
                <p className="ml-4 text-center text-sm font-bold">
                  {employee.first_name} {employee.last_name}
                </p>
              </div>
              <p className="text-right text-xs">Hired: {employee.date_hired}</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="bg-backgroundReverese fixed inset-0 bg-opacity-50"
        onClick={onClose}
      ></div>
    </div>
  );
};
export default EmployeeDetailModal;
