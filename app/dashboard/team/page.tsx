'use client';
// import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import { Contract, Role } from './components/common/types';
import { useEmployee } from '@/hooks/useEmployee';
import './styles/style.scss';
import PageContainer from '@/components/layout/page-container';
import Team from './components/team/Team';
import Roster from './components/roster/Roster';
import Timesheet from './components/timesheet/Timesheet';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Employee } from '@/types';
interface RosterGroup {
  id: number;
  group_name: string;
}
const TeamIndex = () => {
  const {
    getEmployees,
    getGroupSchedule,
    getDeletedEmployees,
    getEmployeementContract,
    getEmployeeRoles
  } = useApi();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rosterGroups, setRosterGroups] = useState<RosterGroup[]>([]);
  const { currentEmployee } = useEmployee();
  const [activeForm, setActiveForm] = React.useState('team');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);
  const fetchContracts = useCallback(async () => {
    const response = await getEmployeementContract();
    if (!response.error) {
      setContracts(response.data);
    }
  }, []);
  const fetchRoles = useCallback(async () => {
    const response = await getEmployeeRoles();
    if (!response.error) {
      setRoles(response.data);
    }
  }, []);
  const fetchDeletedEmployees = useCallback(async () => {
    const response = await getDeletedEmployees();
    if (!response.error) {
      setDeletedEmployees(response.data.employees);
    }
  }, []);
  const fetchEmployees = useCallback(async () => {
    const callback = (error: any, data: any) => {
      if (error) {
        console.error('Error fetching employees:', error);
      } else {
        const updatedEmployees = data.employees.map((employee: any) => {
          const employeeContract = contracts.find((contract) => {
            return contract.id === employee.employment_contract_id;
          });
          const employeeRoles = roles.find(
            (role) => role.id === employee.employment_role_id
          );
          return {
            ...employee,
            contract: employeeContract ? employeeContract.contract : '',
            roles: employeeRoles ? employeeRoles.title : ''
          };
        });
        setEmployees(updatedEmployees);
      }
    };
    const response = await getEmployees();
    callback(response.error, response.data);
  }, [contracts, roles]);
  useEffect(() => {
    fetchContracts();
    fetchRoles();
    fetchDeletedEmployees();
  }, []);
  useEffect(() => {
    fetchEmployees();
  }, [contracts, roles]);
  useEffect(() => {
    const asyncFunction = async () => {
      const response3 = await getDeletedEmployees();
      if (!response3.error) {
        setDeletedEmployees(response3.data.employees);
      }
    };
    asyncFunction();
  }, []);
  useEffect(() => {
    const fetchRosterGroups = async () => {
      const response = await getGroupSchedule();
      if (response.error) {
        console.error('Error fetching group schedule:', response.error);
      } else {
        setRosterGroups(
          response.map((group: RosterGroup) => ({
            id: group.id,
            group_name: group.group_name
          }))
        );
      }
    };
    fetchRosterGroups();
    fetchEmployees();
  }, []);
  useEffect(() => {
    if (contracts.length > 0 && roles.length > 0) {
      fetchEmployees();
    }
  }, [contracts, roles]);
  const allEmployees = useMemo(() => {
    return [...employees, ...deletedEmployees];
  }, [employees, deletedEmployees]);
  return (
    <PageContainer scrollable>
      <div className="mb-4">
        <Heading
          title={`Team`}
          description="Manage your team"
          titleClass="text-xl"
          descriptionClass="text-sm"
        />
      </div>
      <Tabs value={activeForm} onValueChange={setActiveForm}>
        <div className="mb-4">
          <TabsList className="flex w-fit flex-wrap bg-background md:block md:flex-nowrap">
            {['team', 'roster', 'timesheet'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 py-2 text-center hover:text-primary data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="team">
          <Team
            employees={employees}
            deletedEmployees={deletedEmployees}
            fetchEmployees={fetchEmployees}
            fetchDeletedEmployees={fetchDeletedEmployees}
          />
        </TabsContent>
        <TabsContent value="roster">
          <Roster
            employees={employees}
            setEmployees={setEmployees}
            rosterGroups={rosterGroups}
            setRosterGroups={setRosterGroups}
          />
        </TabsContent>
        <TabsContent value="timesheet">
          <Timesheet
            employees={employees}
            rosterGroups={rosterGroups}
            currentEmployee={currentEmployee}
            allEmployees={allEmployees}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};
export default TeamIndex;
