// types.ts
export interface PayRate {
  day_number: number;
  rate: number;
}

export interface EmployeePermissions {
  home: number;
  pos_setting: number;
  team: number;
}
export interface Contract {
  id: number;
  contract: string;
}

export interface Role {
  id: number;
  title: string;
}

export interface Floor {
  id: number | string;
  name: string;
}

export interface Shift {
  id: number | null;
  start_time: string;
  floor_id?: number;
  break_time?: number;
  type: string;
  end_date?: string;
  station_id?: number;
  start_date: string;
  end_time: string;
  deleted?: boolean;
  employee_id: string;
  note?: string;
  color?: string;
}

export interface Schedule {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  employees: number;
  dateRange?: string;
}

export interface EmployeeShifts {
  [employeeId: string]: Shift[];
}
