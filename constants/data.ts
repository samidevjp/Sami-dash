import { NavItem } from '@/types';

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};

export const users: User[] = [
  {
    id: 1,
    name: 'Candice Schiner',
    company: 'Dell',
    role: 'Frontend Developer',
    verified: false,
    status: 'Active'
  },
  {
    id: 2,
    name: 'John Doe',
    company: 'TechCorp',
    role: 'Backend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    company: 'WebTech',
    role: 'UI Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 4,
    name: 'David Smith',
    company: 'Innovate Inc.',
    role: 'Fullstack Developer',
    verified: false,
    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    company: 'TechGuru',
    role: 'Product Manager',
    verified: true,
    status: 'Active'
  },
  {
    id: 6,
    name: 'James Brown',
    company: 'CodeGenius',
    role: 'QA Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 7,
    name: 'Laura White',
    company: 'SoftWorks',
    role: 'UX Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 8,
    name: 'Michael Lee',
    company: 'DevCraft',
    role: 'DevOps Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 9,
    name: 'Olivia Green',
    company: 'WebSolutions',
    role: 'Frontend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 10,
    name: 'Robert Taylor',
    company: 'DataTech',
    role: 'Data Analyst',
    verified: false,
    status: 'Active'
  }
];

export type Employee = {
  id: any;
  branch_id: any;
  user_id: any;
  first_name: any;
  last_name: any;
  pin: any;
  quick_pin: any;
  system_pin: any;
  mobile_no: any;
  role: any;
  myob_uid: any;
  xero_uid: any;
  deleted_at: any;
  created_at?: any;
  updated_at: any;
  emailAddress: any;
  address: any;
  photo: any;
  [key: string]: any;
};

// icon should match the icon name in components/icons.tsx
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    // permission: 'mainNav.reservations',
    employeePermission: 'home.REPORTS',
    admin: true
  },
  {
    title: 'Wabi App',
    href: '/pos',
    icon: 'billing',
    label: 'POS',
    permission: 'mainNav.reservations',
    admin: false
    // employeePermission: 'pos_setting.'
  },
  {
    title: 'Request Booking',
    href: '/dashboard/request-booking',
    icon: 'mail',
    label: 'Request Booking',
    permission: 'mainNav.reservations',
    admin: false
    // employeePermission: 'pos_setting.'
  },
  {
    title: 'Quick Sale',
    href: '/quick-sale',
    icon: 'cart',
    label: 'Quick Sale',
    permission: 'mainNav.pos',
    admin: false
    // employeePermission: 'pos_setting.POS_NAME'
  },
  // {
  //   title: 'Reservation Settings',
  //   href: '/dashboard/reservation-settings',
  //   icon: 'settings',
  //   label: 'Reservation Settings',
  //   permission: 'mainNav.reservations'
  //   // employeePermission: 'home.POS_SETTINGS'
  // },
  {
    title: 'onAccount',
    href: '/dashboard/onAccount',
    icon: 'user',
    label: 'onAccount',
    permission: 'pos.onAccount',
    employeePermission: 'pos_setting.ON_ACCOUNT',
    admin: true
  },
  {
    title: 'Promotion',
    // href: '/dashboard/marketing',
    icon: 'gift',
    label: 'Promotion',
    employeePermission: 'home.EXPERIENCE_SALES_REPORT',
    permission: 'mainNav.invoice',
    admin: true,
    subItems: [
      // {
      //   title: 'Email Campaigns',
      //   href: '/dashboard/marketing',
      //   icon: 'mail',
      //   label: 'Email Campaigns',
      //   admin: true
      // },
      {
        title: 'Wabi Post',
        href: '/dashboard/wabi-post',
        icon: 'mail',
        label: 'Wabi Post',
        admin: true
      },
      {
        title: 'Gift Card',
        href: '/dashboard/gift-card',
        icon: 'gift',
        label: 'Gift Card',
        admin: true
      }
    ]
    // permission: 'emailCampaigns'
  },
  {
    title: 'Online Store',
    // href: '/dashboard/marketing',
    icon: 'store',
    label: 'OnlineStore',
    employeePermission: 'home.EXPERIENCE_SALES_REPORT',
    permission: 'mainNav.invoice',
    admin: true,
    subItems: [
      {
        title: 'Online Orders',
        href: '/dashboard/online-orders',
        icon: 'page',
        label: 'Online Orders',
        permission: 'mainNav.online_store',
        admin: true
      },
      {
        title: 'Online Store Settings',
        href: '/dashboard/online-store',
        icon: 'settings',
        label: 'Online Store',
        permission: 'mainNav.online_store',
        employeePermission: 'home.RESTAURANT_PROFILE',
        admin: true
      }
    ]
  },

  // {
  //   title: 'Online Orders',
  //   href: '/dashboard/online-orders',
  //   icon: 'page',
  //   label: 'Online Orders',
  //   permission: 'mainNav.online_store',
  //   admin: true
  // },
  {
    title: 'Received Invoices',
    href: '/dashboard/inventory-invoice',
    icon: 'page',
    label: 'Inventory Invoices',
    permission: 'mainNav.invoice',
    // employeePermission: '',
    admin: true
  },
  // {
  //   title: 'Payment Link',
  //   href: '/dashboard/payment-link',
  //   icon: 'link',
  //   label: 'Payment Link',
  //   admin: true
  // },
  {
    title: 'Bump',
    href: '/bump',
    icon: 'dashboard',
    label: 'Bump',
    permission: 'mainNav.bump',
    employeePermission: 'home.POS_SETTINGS',
    admin: true
  },
  {
    title: 'inventory',
    href: '/dashboard/inventory',
    icon: 'inventory',
    label: 'inventory',
    permission: 'mainNav.inventory',
    employeePermission: 'home.EXPERIENCE_SALES_REPORT',
    admin: true
  },
  {
    title: 'Online Payments',
    href: '/dashboard/invoice',
    icon: 'invoice',
    label: 'invoice',
    permission: 'mainNav.invoice',
    employeePermission: 'home.REPORTS',
    admin: true
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: 'user',
    label: 'Team',
    permission: 'mainNav.team',
    employeePermission: 'team.TEAM',
    admin: true
  },
  {
    title: 'Integrations',
    href: '/dashboard/integrations',
    icon: 'logo',
    label: 'Integrations',
    permission: 'mainNav.integrations',
    employeePermission: 'home.INTEGRATIONS',
    admin: true
  },
  // {
  //   title: 'Task Management',
  //   href: '/dashboard/kanban',
  //   icon: 'kanban',
  //   label: 'Tasks',
  //   admin: false
  //   // permission: 'teams.team',
  //   // employeePermission: 'team.ROSTER'
  // },
  {
    title: 'Docket View',
    href: '/dashboard/transactions',
    icon: 'page',
    label: 'Docket View',
    permission: 'pos.docketView',
    employeePermission: 'pos_setting.DOCKET_VIEW',
    admin: false
  },
  {
    title: 'Tickets',
    href: '/dashboard/tickets',
    icon: 'ticket',
    label: 'Tickets',
    admin: false,
    permission: 'mainNav.reservations'
    // employeePermission
  },
  {
    title: 'Settings',
    icon: 'settings',
    label: 'Settings',
    admin: true,
    subItems: [
      {
        title: 'General Settings',
        href: '/dashboard/general-settings',
        icon: 'settings',
        label: 'General',
        admin: true
      },
      {
        title: 'Reservation Settings',
        href: '/dashboard/reservation-settings',
        icon: 'settings',
        label: 'Reservation',
        permission: 'mainNav.reservations',
        admin: true
      },

      {
        title: 'Surcharge Settings',
        href: '/dashboard/surcharge-settings',
        icon: 'settings',
        label: 'Surcharge',
        permission: 'pos.surchargeSetting',
        employeePermission: 'pos_setting.SURCHARGE_SETTINGS',
        admin: true
      }
      // {
      //   title: 'Hardware Settings',
      //   href: '/dashboard/hardware',
      //   icon: 'printer',
      //   label: 'Hardware',
      //   permission: 'mainNav.printerSettings',
      //   employeePermission: 'home.PRINTERS',
      //   admin: true
      // }
    ]
  }
  // {
  //   title: 'Payments',
  //   href: '/dashboard/payments',
  //   icon: 'billing',
  //   label: 'Payments',
  //   admin: true
  // },

  // {
  //   title: 'Pin',
  //   href: '/pin',
  //   icon: 'pin',
  //   label: 'Pin',
  //   permission: ''
  // }
];

export const PricingKeys = {
  Reservations: 'Reservations',
  POS: 'POS',
  POSPlus: 'POSPlus',
  Team: 'Team',
  OnlineStore: 'OnlineStore',
  FullPackage: 'FullPackage',
  Trial: 'Trial',
  Custom: 'Custom'
} as const;

export type PricingKey = keyof typeof PricingKeys;
export const CustomFeatures: PricingKey[] = [
  'Reservations',
  'Team',
  'POS',
  'OnlineStore'
];
export interface PricingInfo {
  id: string;
  title: string;
  price: number | string;
  description: string;
  features: string[];
  buttonText: string;
  link?: string;
  buttonDisabled?: boolean;
  isShowTransactionFee: boolean;
}

export const customPricingInfo: Record<PricingKey, PricingInfo> = {
  Reservations: {
    id: 'reservation',
    title: 'Reservations',
    price: 99,
    description:
      'Streamline online reservations and table management effortlessly.',
    features: [
      'Online Reservations',
      'Table Management',
      'Guest Communications'
    ],
    buttonText: 'Get Started',
    link: '/features/bookings',
    isShowTransactionFee: true
  },
  POS: {
    id: 'pos',
    title: 'POS + Inventory',
    price: 99,
    description: 'Manage orders, payments, and menus seamlessly in one system.',
    features: [
      'Order Management',
      'Payment Processing',
      'Menu Management',
      'Kitchen Display',
      'Real-time Reports',
      'Real-time Tracking',
      'Cost Analysis',
      'Recipe Management',
      'Supplier Management',
      'OCR Scanning',
      'Automated Ordering'
    ],
    buttonText: 'Get Started',
    link: '/features/pos',
    isShowTransactionFee: true
  },
  POSPlus: {
    id: 'pos-plus',
    title: 'POS Plus (Includes Inventory)',
    price: 199,
    description:
      'All POS features plus inventory management and cost analysis.',
    features: [
      'Order Management',
      'Payment Processing',
      'Menu Management',
      'Kitchen Display',
      'Real-time Reports',
      'Inventory Management',
      'Supplier Management',
      'Recipe Management',
      'Cost Analysis',
      'Automated Ordering'
    ],
    buttonText: 'Get Started',
    isShowTransactionFee: true
  },
  Team: {
    id: 'team',
    title: 'Team',
    price: 11,
    description:
      'Enhance team coordination with reservation and guest management.',
    features: [
      'Online Reservations',
      'Table Management',
      'Guest Communications'
    ],
    buttonText: 'Get Started',
    link: '/features/team',
    isShowTransactionFee: false
  },
  OnlineStore: {
    id: 'online_store',
    title: 'Online Store + Inventory',
    price: 99,
    description:
      'Easily manage an online store with customizable designs and simple product management.',
    features: [
      'Customizable design',
      'Easy category management',
      'Simple product management',
      'User-friendly dashboard',
      'Real-time Tracking',
      'Cost Analysis',
      'Recipe Management',
      'Supplier Management',
      'OCR Scanning',
      'Automated Ordering'
    ],
    buttonText: 'Get Started',
    link: '/features/online-store',
    isShowTransactionFee: true
  },
  // Inventory: {
  //   title: "Inventory",
  //   price: 99,
  //   description:
  //     "Track inventory in real-time with automated ordering and cost analysis.",
  //   features: [
  //     "Real-time Tracking",
  //     "Cost Analysis",
  //     "Recipe Management",
  //     "Supplier Management",
  //     "OCR Scanning",
  //     "Automated Ordering",
  //   ],
  //   buttonText: "Get Started",
  //   link: "/features/inventory",
  // },
  FullPackage: {
    id: 'full-package',
    title: 'Full Package',
    price: 399,
    description:
      'All-in-one solution with POS, reservations, inventory, and online store management.',
    features: [
      'Reservations',
      'Point of Sale',
      'Team Management',
      'Inventory Management',
      'Online Store'
    ],
    buttonText: 'Get Started',
    isShowTransactionFee: true
  },
  Trial: {
    id: 'trial',
    title: 'Trial',
    price: '0',
    description: 'Try essential features for free.',
    features: [
      'Access to core restaurant management tools',
      'Basic order and table management',
      'Limited sales insights and reporting',
      'Community forum support'
    ],
    buttonText: 'Start for Free',
    buttonDisabled: false,
    isShowTransactionFee: true
  },
  Custom: {
    id: 'custom',
    title: 'Custom',
    price: 'Custom',
    description: 'Tailored solutions for your restaurant&apos;s unique needs.',
    features: [
      'All features from Full Package',
      'Custom integrations and API access',
      'Personalized onboarding and training',
      'Dedicated account manager',
      'Enterprise-level support'
    ],
    buttonText: 'Customize Your Plan',
    buttonDisabled: false,
    isShowTransactionFee: false
  }
};
