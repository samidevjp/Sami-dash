import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';

import { daysOfWeek } from '../../common/const';
import DetailsInfo from './DetailsInfo';
import AccountInfo from './AccountInfo';
import SecurityInfo from './SecurityInfo';
import EmploymentInfo from './EmploymentInfo';
import PayRates from './PayRates';
import StaffPermissions from './StaffPermissions';
import ColorPickerModal from '@/components/pos/color-picker-modal';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Pipette, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getRelativeLuminance } from '@/utils/common';
import { toast } from '@/components/ui/use-toast';
import { Employee } from '@/types';

interface AddEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  fetchEmployees: () => Promise<void>;
  employees: Employee[];
  fetchDeletedEmployees: () => Promise<void>;
}
const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  employee,
  open,
  onClose,
  fetchEmployees,
  employees,
  fetchDeletedEmployees
}) => {
  useEffect(() => {}, []);
  const initialEmployeeState: Employee = {
    id: 0,
    photo: '',
    first_name: '',
    last_name: '',
    address: '',
    mobile_no: '',
    emailAddress: '',
    date_hired: '',
    tax_no: '',
    bank_account: '',
    bank_name: '',
    quick_pin: '',
    system_pin: '',
    color: '#cccccc',
    role: 'staff',
    roles: [],
    employment_contract_id: 0,
    employment_role_id: 0,
    contract: '',
    level: 1,
    pay_rates: Object.values(daysOfWeek).map((day) => ({
      day_number: day,
      rate: 0
    })),
    pay_basis: 0,
    pay_cycle: 0,
    annual_salary: 0,
    hourly_rate: 0,
    hours_pay_cycle: 0,
    pay_wages_item: [],
    permissions: {
      home: 0,
      pos_setting: 0,
      team: 0
    },
    deleted_at: ''
  };
  const {
    addEmployee,
    deleteEmployee,
    updateEmployee,
    uploadEmployeePhoto,
    restoreEmployee
  } = useApi();
  const [newEmployee, setNewEmployee] =
    useState<Employee>(initialEmployeeState);
  const [file, setFile] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeSystemPin, setActiveSystemPin] = useState<boolean>(false);
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (open) {
      const updatedEmployee: Employee = {
        ...initialEmployeeState,
        ...employee,
        color: employee?.color || '#cccccc',
        level: employee?.level || 1
      };

      setNewEmployee(updatedEmployee);
      setFile(
        employee ? `${process.env.NEXT_PUBLIC_IMG_URL}${employee.photo}` : null
      );
      setFileObject(null);
      setCurrentStep(0);
      setError('');
      if (employee?.role === 'owner' || employee?.role === 'manager') {
        setActiveSystemPin(true);
      } else {
        setActiveSystemPin(false);
      }
    }
  }, [open, employee]);
  const checkDuplicatePins = () => {
    const duplicateQuickPin = employees.some(
      (emp) =>
        emp.id !== newEmployee.id && emp.quick_pin === newEmployee.quick_pin
    );
    if (duplicateQuickPin) {
      setError('Quick Pin is already in use.');
      return false;
    }
    return true;
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setFile(fileUrl);
      setFileObject(selectedFile);
      setIsError(false);
    }
  };
  const handleSaveEmployee = async () => {
    if (!checkDuplicatePins()) return;
    setIsSaving(true);
    const saveEmployee = async (employeeId: number) => {
      if (fileObject) {
        try {
          await uploadEmployeePhoto({ id: employeeId }, fileObject);
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError);
          return;
        }
      }
      try {
        await updateEmployee({ ...newEmployee, id: employeeId });
        await fetchEmployees();
        onClose();
      } catch (error) {
        console.error('Update failed:', error);
      }
    };
    if (employee && employee.id) {
      if (employee) {
        try {
          await saveEmployee(Number(employee.id));
        } catch (error) {
          console.error('Failed to update employee:', error);
        } finally {
          setIsSaving(false);
        }
      }
    } else {
      try {
        const { data } = await addEmployee({
          ...newEmployee,
          pin: Math.floor(Math.random()),
          pin_confirmation: Math.floor(Math.random())
        });
        const newStaff = data.staff;
        await saveEmployee(newStaff.id);
      } catch (error) {
        console.error('Failed to add employee:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };
  const handleDeleteEmployee = async () => {
    try {
      const response = await deleteEmployee(employee);
      console.log('Employee deleted successfully:', response.data);
      // onAddEmployee(null);
      await fetchEmployees();
      await fetchDeletedEmployees();
      toast({
        title: 'Employee Deactivated',
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast({
        title: 'Failed to deactivate employee',
        variant: 'destructive'
      });
    } finally {
      setConfirmationModal(false);
      onClose();
    }
  };

  const handleRestoreEmployee = async () => {
    const params = {
      id: newEmployee.id
    };
    try {
      const response = await restoreEmployee(params);
      console.log('Employee restored successfully:', response.data);
      await fetchEmployees();
      await fetchDeletedEmployees();
      toast({
        title: 'Employee Restored',
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to restore employee', error);
      toast({
        title: 'Failed to restore employee',
        variant: 'destructive'
      });
    } finally {
      setConfirmationModal(false);
      onClose();
    }
  };
  const steps = useMemo(
    () => [
      {
        label: 'Details Info',
        content: (
          <DetailsInfo
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
          />
        )
      },
      {
        label: 'Account Info',
        content: (
          <AccountInfo
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
          />
        )
      },
      {
        label: 'Employment Info',
        content: (
          <EmploymentInfo
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            activeSystemPin={activeSystemPin}
            setActiveSystemPin={setActiveSystemPin}
          />
        )
      },
      {
        label: 'Security Info',
        content: (
          <SecurityInfo
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            activeSystemPin={activeSystemPin}
          />
        )
      },
      {
        label: 'Pay Rates',
        content: (
          <PayRates
            payRates={newEmployee.pay_rates}
            setPayRates={(pay_rates) =>
              setNewEmployee({ ...newEmployee, pay_rates })
            }
          />
        )
      },
      {
        label: 'Staff Permissions',
        content: (
          <StaffPermissions
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
          />
        )
      }
    ],
    [newEmployee]
  );
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center px-4 backdrop-blur-sm ${
        open ? 'block' : 'hidden'
      }`}
    >
      <div
        className="relative h-full max-h-[600px] w-full max-w-3xl overflow-y-auto rounded-lg bg-background p-10 shadow-lg"
        style={{ height: '80dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant={'ghost'}
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={24} />
        </Button>
        <div className="h-full gap-8 md:flex">
          <div className="flex flex-col items-center md:mr-4">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                backgroundColor: newEmployee.color,
                color: getRelativeLuminance(newEmployee.color)
              }}
            >
              {file && !isError ? (
                <Image
                  width={200}
                  height={200}
                  src={file}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                  onError={() => setIsError(true)}
                />
              ) : (
                <div className="text-xl font-bold">
                  {newEmployee?.first_name.charAt(0)}
                  {newEmployee?.last_name.charAt(0)}
                </div>
              )}
            </div>
            <Button
              className="mt-6 px-4"
              onClick={() => fileInputRef.current?.click()}
              variant={'outline'}
            >
              <span className="flex items-center space-x-2">
                <Upload className="inline-block h-4 w-4" />
                <span>Upload Image</span>
              </span>
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              className="mt-4 px-4"
              onClick={() => setShowColorPicker(!showColorPicker)}
              variant={'outline'}
            >
              <span className="flex items-center space-x-2">
                <Pipette className="inline-block h-4 w-4" />
                <span>Change Color</span>
              </span>
            </Button>
            <ColorPickerModal
              open={showColorPicker}
              setOpenColorPickerModal={setShowColorPicker}
              sendColor={(color: any) =>
                setNewEmployee({ ...newEmployee, color })
              }
            />

            {newEmployee.deleted_at ? (
              <Button
                className="mt-4 w-full bg-green-200 text-green-900"
                onClick={() => setConfirmationModal(true)}
              >
                Restore
              </Button>
            ) : (
              <Button
                variant={'danger'}
                className="mt-4 w-full"
                onClick={() => setConfirmationModal(true)}
              >
                Deactivate
              </Button>
            )}

            {!newEmployee.deleted_at && (
              <Button
                className="mt-4 w-full px-4"
                onClick={handleSaveEmployee}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
            )}

            <Modal
              title={
                newEmployee.deleted_at
                  ? `Restore Employee`
                  : `Deactivate Employee`
              }
              description={
                newEmployee.deleted_at
                  ? `Are you sure you want to restore this employee?`
                  : `Are you sure you want to deactivate this employee?`
              }
              isOpen={confirmationModal}
              onClose={() => setConfirmationModal(false)}
            >
              <div className="">
                <div className="flex justify-center  space-x-4">
                  <Button
                    className="px-8"
                    onClick={() => setConfirmationModal(false)}
                    variant={'secondary'}
                  >
                    Cancel
                  </Button>

                  {newEmployee.deleted_at ? (
                    <Button
                      className="px-8"
                      onClick={() => handleRestoreEmployee()}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      variant={'danger'}
                      className="px-8"
                      onClick={() => handleDeleteEmployee()}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </Modal>
          </div>
          <div className="relative flex flex-1 flex-col">
            <div className="mb-4 mt-4 justify-between bg-background md:flex">
              <div className="mr-2 w-full">
                <Label>
                  <p className="mb-2 text-muted-foreground">First name</p>
                </Label>
                <Input
                  type="text"
                  className="w-full flex-1 rounded-lg px-4 py-2"
                  placeholder="First Name"
                  value={newEmployee.first_name}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      first_name: e.target.value
                    })
                  }
                />
              </div>
              <div className="w-full">
                <Label>
                  <p className="mb-2 text-muted-foreground">Last name</p>
                </Label>
                <Input
                  type="text"
                  className="w-full flex-1 rounded-lg px-4 py-2"
                  placeholder="Last Name"
                  value={newEmployee.last_name}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      last_name: e.target.value
                    })
                  }
                />
              </div>
            </div>
            <h6 className="my-4 text-center text-xl">
              {steps[currentStep].label}
            </h6>

            <div className="flex-1 overflow-y-auto px-4 pb-32">
              <div>{steps[currentStep].content}</div>
              {error && <p className="mt-4 text-center text-danger">{error}</p>}
            </div>

            <div className="absolute bottom-0 left-0 flex w-full justify-between bg-background pt-8">
              <Button
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                disabled={currentStep === 0}
                variant={currentStep > 0 ? 'default' : 'outline'}
              >
                Back
              </Button>
              <Button
                onClick={() =>
                  setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
                }
                disabled={currentStep === steps.length - 1}
                variant={currentStep < steps.length - 1 ? 'default' : 'outline'}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AddEmployeeModal;
