import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Contract, Role } from '../../common/types';
import { Trash, LogOut, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Employee } from '@/types';
interface EmploymentInfoProps {
  newEmployee: Employee;
  setNewEmployee: React.Dispatch<React.SetStateAction<Employee>>;
  activeSystemPin: boolean;
  setActiveSystemPin: React.Dispatch<React.SetStateAction<boolean>>;
}
const EmploymentInfo: React.FC<EmploymentInfoProps> = ({
  newEmployee,
  setNewEmployee,
  activeSystemPin,
  setActiveSystemPin
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [activeEmployeeType, setActiveEmployeeType] = useState<string | null>(
    null
  );
  const [contracts, setContracts] = useState<Contract[]>([]);
  // const [activeContract, setActiveContract] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  // const [activeRole, setActiveRole] = useState<string | null>(null);
  const [editMode, setEditMode] = useState({ contracts: false, roles: false });
  const [employeeLevel, setEmployeeLevel] = useState<number>(1);
  const {
    getEmployeementContract,
    addEmployeeContract,
    deleteEmployeeContract,
    getEmployeeRoles,
    addEmployeeRole,
    deleteEmployeeRole
  } = useApi();
  useEffect(() => {
    const asyncFunction = async () => {
      const getContractsResponse = await getEmployeementContract();
      if (!getContractsResponse.error) {
        setContracts(getContractsResponse.data);
      }
      const getRolesResponse = await getEmployeeRoles();
      if (!getRolesResponse.error) {
        setRoles(getRolesResponse.data);
      }
    };
    asyncFunction();
  }, []);
  useEffect(() => {
    // if (newEmployee.employment_contract_id) {
    // const contractIndex = contracts.findIndex(
    //   (contract) => contract.id === newEmployee.employment_contract_id
    // );
    // if (contractIndex !== -1) {
    //   setActiveContract(`contract-${contractIndex}`);
    // }
    // }
    // if (newEmployee.employment_role_id) {
    // const roleIndex = roles.findIndex(
    //   (role) => role.id === newEmployee.employment_role_id
    // );
    // if (roleIndex !== -1) {
    //   setActiveRole(`role-${roleIndex}`);
    // }
    // }
    if (newEmployee.level) {
      setEmployeeLevel(newEmployee.level);
    }
  }, [contracts, roles]);
  useEffect(() => {
    if (newEmployee.role) {
      const roleIndex = ['owner', 'manager', 'staff'].indexOf(newEmployee.role);
      if (roleIndex !== -1) {
        setActiveEmployeeType(`role-${roleIndex}`);
      }
    }
  }, [newEmployee.role]);
  const handleOpen = (title: string) => {
    setModalTitle(title);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleSave = () => {
    if (name) {
      if (modalTitle === 'Contracts') {
        const asyncFunction = async () => {
          const response = await addEmployeeContract({
            contract: name,
            description: ''
          });
          if (!response.error) {
            setContracts([...contracts, response.data.employment_contract]);
            setNewEmployee({
              ...newEmployee,
              employment_contract_id: response.data.employment_contract.id
            });
          }
        };
        asyncFunction();
      } else if (modalTitle === 'Roles') {
        const asyncFunction = async () => {
          const response = await addEmployeeRole({ title: name });
          if (!response.error) {
            setRoles([...roles, response.data.employment_role]);
            setNewEmployee({
              ...newEmployee,
              employment_role_id: response.data.employment_role.id
            });
          }
        };
        asyncFunction();
      }
      setName('');
      handleClose();
    }
  };
  const handleButtonClick = (
    key: string,
    category: string,
    id: string | null = null
  ) => {
    if (category === 'employeeType') {
      setActiveEmployeeType((prev) => (prev === key ? null : key));
      if (id) {
        setNewEmployee({ ...newEmployee, role: id });
        if (id === 'staff') {
          setActiveSystemPin(false);
        } else {
          setActiveSystemPin(true);
        }
      }
    } else if (category === 'role') {
      // setActiveRole((prev) => (prev === key ? null : key));
      if (id) {
        setNewEmployee({ ...newEmployee, employment_role_id: Number(id) });
      }
    }
  };
  const handleDelete = async (id: number, category: string) => {
    if (category === 'contract') {
      const response = await deleteEmployeeContract(id);
      if (!response.error) {
        setContracts([...response.data.employment_contract]);
      }
    } else if (category === 'role') {
      const response = await deleteEmployeeRole(id);
      if (!response.error) {
        setRoles([...response.data.employment_role]);
      }
    }
  };
  const increaseLevel = () => {
    if (employeeLevel < 5) {
      setEmployeeLevel(employeeLevel + 1);
      setNewEmployee({
        ...newEmployee,
        level: employeeLevel + 1
      });
    }
  };
  const decreaseLevel = () => {
    if (employeeLevel > 1) {
      setEmployeeLevel(employeeLevel - 1);
      setNewEmployee({
        ...newEmployee,
        level: employeeLevel - 1
      });
    }
  };
  return (
    <>
      <div className="mb-4">
        <Label className="text-muted-foreground">Employee Type</Label>
        <div className="mb-4 mt-2 flex gap-3">
          {['owner', 'manager', 'staff'].map((role, index) => (
            <button
              key={index}
              onClick={() => {
                setNewEmployee({ ...newEmployee, role });
                handleButtonClick(`role-${index}`, 'employeeType', role);
              }}
              className={`rounded-full px-3 py-2 text-xs ${
                activeEmployeeType === `role-${index}`
                  ? 'bg-gradient-to-r from-[#976AD4] to-[#E3B0B3] text-white'
                  : 'bg-gray-400 text-white'
              }`}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
        {activeSystemPin && (
          <p className="text-xs text-muted-foreground">
            Make sure to set the system pin on the next page.
          </p>
        )}
      </div>
      <div className="mb-4">
        <div className="flex justify-between">
          <Label className="mb-2 mt-4 text-muted-foreground">Contracts</Label>
          <Button
            variant={'ghost'}
            className=""
            onClick={() =>
              setEditMode((prev) => ({ ...prev, contracts: !prev.contracts }))
            }
          >
            {editMode.contracts ? (
              <LogOut className="h-5 w-5" />
            ) : (
              <Ellipsis className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div
          className={`mb-4 ${
            editMode.contracts ? 'block' : 'flex flex-wrap'
          } gap-3`}
        >
          {contracts.map((contract, index) => (
            <div key={index} className="relative text-base">
              {editMode.contracts ? (
                <div className="mb-4 flex items-center">
                  <Button
                    variant={'ghost'}
                    onClick={() => handleDelete(contract.id, 'contract')}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                  <p className="text-sm">{contract.contract}</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNewEmployee({
                      ...newEmployee,
                      employment_contract_id: contract.id
                    });
                  }}
                  className={`rounded-full px-3 py-2 text-xs ${
                    newEmployee.employment_contract_id === contract.id
                      ? 'bg-gradient-to-r from-[#976AD4] to-[#E3B0B3] text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {contract.contract}
                </button>
              )}
            </div>
          ))}
          {!editMode.contracts && (
            <button
              onClick={() => handleOpen('Contracts')}
              className="rounded-full bg-gray-400 px-3 text-sm text-white"
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between align-middle">
          <Label className="mb-2 mt-4 text-muted-foreground">Roles</Label>
          <Button
            variant={'ghost'}
            className=""
            onClick={() =>
              setEditMode((prev) => ({ ...prev, roles: !prev.roles }))
            }
          >
            {editMode.roles ? (
              <LogOut className="h-5 w-5" />
            ) : (
              <Ellipsis className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div
          className={`mb-4 ${
            editMode.roles ? 'block' : 'flex flex-wrap'
          } gap-3`}
        >
          {roles.map((role, index) => (
            <div key={index} className="relative">
              {editMode.roles ? (
                <div className="mb-4 flex items-center">
                  <Button
                    variant={'ghost'}
                    onClick={() => handleDelete(role.id, 'role')}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                  <p className="text-sm">{role.title}</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNewEmployee({
                      ...newEmployee,
                      employment_role_id: role.id
                    });
                  }}
                  className={`rounded-full px-3 py-2 text-xs ${
                    newEmployee.employment_role_id === role.id
                      ? 'bg-gradient-to-r from-[#976AD4] to-[#E3B0B3] text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {role?.title}
                </button>
              )}
            </div>
          ))}
          {!editMode.roles && (
            <button
              onClick={() => handleOpen('Roles')}
              className="rounded-full bg-gray-400 px-3 text-sm text-white"
            >
              +
            </button>
          )}
        </div>
      </div>
      <div className="mb-4">
        <Label className="mb-2 mt-4 text-muted-foreground">Level</Label>
        <div className="flex items-center gap-2">
          <button
            onClick={decreaseLevel}
            className="rounded bg-gray-400 px-2 text-white"
          >
            -
          </button>
          <div className="star-display ml-2 flex min-w-32 gap-1">
            {Array.from({ length: employeeLevel }).map((_, index) => (
              <span
                key={index}
                className={
                  index < newEmployee.level
                    ? 'text-xl text-yellow-500'
                    : 'text-xl text-gray-400'
                }
              >
                ⭐
              </span>
            ))}
          </div>
          <button
            onClick={increaseLevel}
            className="rounded bg-gray-400 px-2 text-white"
          >
            +
          </button>
        </div>
      </div>
      <Modal
        title={`Add New ${modalTitle}`}
        description=""
        isOpen={open}
        onClose={() => handleClose()}
      >
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 rounded-lg border border-gray-300 p-2"
          placeholder={`Input New ${modalTitle}`}
        />
        <div className="mt-8 flex justify-between gap-8">
          <Button
            onClick={handleClose}
            className="w-full"
            variant={'secondary'}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full">
            Add
          </Button>
        </div>
      </Modal>
    </>
  );
};
export default EmploymentInfo;
