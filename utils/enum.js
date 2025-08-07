export const TABLETYPE = {
  singleTable: 1,
  twoSingleTable: 2,
  threeSingleTable: 3,
  singlePairTable: 4,
  twoSinglePairTable: 5,
  threeSinglePairTable: 6,
  fourSinglePairTable: 7,
  fourPersonSingleTable: 8,
  fourPersonRoundTable: 9,
  sixPersonRoundTable: 10,
  eightPersonRoundTable: 11,
  tenPersonRoundTable: 12,
  halfSeatRoundTable: 13,
  twoPersonRoundTable: 14
};

export const BOOKINGSTATUS = {
  unconfirmed: 0,
  all: 1,
  billed: 2,
  unbill: 3,
  seated: 4,
  unseat: 5,
  finished: 6,
  noShow: 7,
  cancelled: 8,
  seatNotWaitList: 9,
  waitList: 10,
  overTime: 11,
  upcoming: 12,
  late: 13,
  needAttention: 14,
  partiallySeated: 15
};

export const BOOKINGTYPE = {
  inhouse: 1,
  phone: 2,
  experience: 3,
  widget: 0
};

export const RECURRINGTYPE = {
  none: -1,
  annually: 0,
  monthly: 1,
  weekly: 2
};

export const RECURRINGVALUE = {
  none: 0,
  everyDayOfMonth: 1,
  everyDateOfMonth: 2,
  everyNumWeekOfMonth: 3,
  everyMonthDateOfYear: 4,
  everyWeekOfTheYear: 5
};

export const TABLELOCKSTATUS = {
  locked: 1,
  unlocked: 0
};

export const PAYMENTORDERSTATUS = {
  pos: 1,
  quicksale: 2,
  phoneOrder: 3
};

export const daysOfWeek = {
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

export const PERMISSION_LABELS = {
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
