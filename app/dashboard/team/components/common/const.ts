export const daysOfWeek: { [key: string]: number } = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7
};

export const STAFF_HOME_PERMISSIONS = {
  MESSAGES: 1 << 2,
  TABLE_LAYOUT_AND_PLANNING: 1 << 3,
  REPORTS: 1 << 4,
  EXPERIENCE_SALES_REPORT: 1 << 5,
  RESTAURANT_PROFILE: 1 << 6,
  TEAM: 1 << 7,
  POS_SETTINGS: 1 << 8,
  INTEGRATIONS: 1 << 9,
  PRINTERS: 1 << 10
};

export const STAFF_POS_PERMISSIONS = {
  DOCKET_VIEW: 2 << 1,
  DAY_VIEW_SALES: 2 << 2,
  ANALYTICS: 2 << 3,
  HARDWARE: 2 << 4,
  STAFF_ACCESS: 2 << 5,
  REGISTER_SETTINGS: 2 << 6,
  DELETED_ITEMS: 2 << 7,
  DISABLED_PRODUCT_ITEMS: 2 << 10,
  POS_NAME: 2 << 8,
  SURCHARGE_SETTINGS: 2 << 9,
  CASH_DRAWER: 2 << 11,
  ON_ACCOUNT: 2 << 12
};

export const STAFF_TEAM_PERMISSIONS = {
  TEAM: 1 << 1,
  ROSTER: 1 << 2,
  TIMESHEET: 1 << 3,
  SETTINGS: 1 << 4
};

export const permissionCategories = [
  {
    title: 'Home Permission',
    category: 'home',
    permissions: STAFF_HOME_PERMISSIONS
  },
  {
    title: 'POS Setting Permission',
    category: 'pos_setting',
    permissions: STAFF_POS_PERMISSIONS
  },
  {
    title: 'Staff Team Permissions',
    category: 'team',
    permissions: STAFF_TEAM_PERMISSIONS
  }
];

export const PERMISSION_LABELS: { [key: string]: string } = {
  MESSAGES: 'Messages',
  TABLE_LAYOUT_AND_PLANNING: 'Table Layout and Planning',
  REPORTS: 'Reports',
  EXPERIENCE_SALES_REPORT: 'Experience Sales Report',
  RESTAURANT_PROFILE: 'Restaurant Profile',
  TEAM: 'Team',
  POS_SETTINGS: 'POS Settings',
  INTEGRATIONS: 'Integrations',
  PRINTERS: 'Printers',
  DOCKET_VIEW: 'Docket View',
  DAY_VIEW_SALES: 'Day View Sales',
  ANALYTICS: 'Analytics',
  HARDWARE: 'Hardware',
  STAFF_ACCESS: 'Staff Access',
  REGISTER_SETTINGS: 'Register Settings',
  DELETED_ITEMS: 'Deleted Items',
  DISABLED_PRODUCT_ITEMS: 'Disabled Product Items',
  POS_NAME: 'POS Name',
  SURCHARGE_SETTINGS: 'Surcharge Settings',
  CASH_DRAWER: 'Cash Drawer',
  ON_ACCOUNT: 'On Account',
  ROSTER: 'Roster',
  TIMESHEET: 'Timesheet',
  SETTINGS: 'Settings'
};
