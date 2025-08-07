import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  permission?: string;
  employeePermission?: string;
  subItems?: NavItem[];
  admin?: boolean;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface Item {
  id: any;
  title: string;
  description: string;
  price: number;
  quantity: number;
  currentTimestamp?: string;
  addOns?: any[];
  note: string;
  price_type?: priceType;
}

// price_type 1: 'item'
// price_type 2: 'weight'
type priceType = 1 | 2;
export interface BumpOrderProduct {
  id: number;
  status: string;
  uuid: string;
  title: string;
  code: string;
  note: string;
  price: number;
  price_type?: priceType;
  measurement_type?: number;
  total_weight?: number;
  quantity: number;
  pos_product_category_id: number;
  bump_order_add_ons: {
    id: number;
    quantity: number;
    name: string;
    price: number;
  }[];
}
export interface BumpOrder {
  id: number;
  table_name: string;
  booking?: {
    id: number;
    table_id: number[] | null;
    party_size: number;
  };
  guest: {
    id: number;
    first_name: string;
    last_name: string;
    seating_preference: string | null;
    special_relationship: string | null;
    company: string | null;
    phone: string | null;
  };
  total_weight?: number;
  measurement_type?: number;
  price_type: number;
  customer: any;
  order_number: number;
  order_index: number;
  order_date: string;
  status: string;
  order_type: string;
  employee_id: number;
  phone_order_id: number;
  completedTimestamp?: string;
  bump_order_products: BumpOrderProduct[];
  original_bump_order_products?: BumpOrderProduct[];
  uuid: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface BlockTable {
  id: number;
  branch_id: number | null;
  user_id: number;
  table_id: string;
  date: string;
  start_time: number;
  end_time: number;
  is_unblock: number;
  unblock_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: number;
  branch_id?: number | null;
  can_rotate: number | boolean;
  capacity_max: number;
  capacity_min: number;
  color: string;
  created_at?: string;
  floor_id: number;
  is_combined?: number;
  name: string;
  pos_x: number;
  pos_y: number;
  rotate_deg: number;
  table_height?: number | null;
  table_width?: number | null;
  table_type: number;
  updated_at?: string;
  widget_start_date_time?: string;
  widget_end_date_time?: string;
  widget_is_non_reservable: number | boolean;
  block_tables?: BlockTable[];
}
export interface CombinedTable {
  id: number;
  combined_ids: string; // e.g., '|165|269|'
  name: string;
  capacity_min: number;
  capacity_max: number;
}
export interface Floor {
  id: number;
  branch_id?: number | null;
  user_id?: number;
  floor_name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  tables?: Table[];
  combined_tables?: CombinedTable[];
}
export interface PayRate {
  day_number: number;
  rate: number;
}
export interface Employee {
  address: string;
  annual_salary?: any; // NOTE: Needs to check
  bank_account: any;
  bank_name: any;
  branch_id?: string;
  color: string;
  contract?: any; // this type is merged from the other api
  date_hired: any;
  deleted_at: string | null;
  emailAddress: string;
  employment_contract_id?: number;
  employment_role_id?: number;
  first_name: string;
  hourly_rate?: any; // NOTE: Needs to check
  hours_pay_cycle: number;
  id: string | number;
  last_name: string;
  level: number;
  mobile_no: string;
  myob_uid?: string;
  pay_basis: number;
  pay_cycle: number;
  pay_rates: PayRate[];
  pay_wages_item: any[];
  permissions: Record<string, number>;
  photo: string;
  pin?: string;
  quick_pin: string;
  role: string;
  roles?: any; // this type is merged from the other api
  shifts?: any;
  system_pin: string;
  tax_no: string | null;
  updated_at?: string;
  user_id?: string;
  xero_uid?: string;
}

export interface StripePaymentLink {
  id: string;
  url: string;
  active: boolean;
  currency: string;
  metadata: any;
  // Add other relevant fields from the Stripe PaymentLink object if needed
}

export type PaymentMethod = '' | 'cash' | 'card' | 'split' | 'account' | 'more';
export type FeeCreditType = 'domestic' | 'amex';
export type SplitType = 'none' | 'amount' | 'item';
export type PaymentOptionMode =
  | 'tip'
  | 'default'
  | 'custom-tip'
  | 'custom-amount'
  | 'discount'
  | 'custom-discount'
  | 'surcharge'
  | 'split-payment'
  | 'finish'
  | 'split-finish';

export interface PaymentEntry {
  id: string;
  paymentMethod: 'cash' | 'card' | 'split' | 'account' | 'more' | 'redeem' | '';
  amount: number; // Amount paid with this payment
  originalAmount?: number; // Original amount paid before split calculation
  expectedAmount: number; // Amount that was supposed to be paid
  change: number; // Change given back (for cash payments)
  feeCreditType?: 'domestic' | 'amex'; // For card payments
  surchargeAmount: number; // For card payments
  surchargePercentage?: string; // For card payments - actual percentage used
  paymentRef: string; // Reference number for the payment
  timestamp: Date;
  items?: any[]; // Items paid for in this payment (for split by item)
  paymentType?: number; // 1 = cash, 2 = card, 3 = redeem (gift card)
}

export interface CurrentPayment {
  paymentMethod: PaymentMethod;
  amount: number;
  feeCreditType: FeeCreditType;
  surchargeAmount: number;
  surchargePercentage?: string;
  change: number;
  paymentRef: string;
  id?: string; // Split payment ID (e.g., 'split-1', 'split-2')
}

export interface CustomAmount {
  id: string;
  amount: number;
  note: string;
}

export interface PaymentState {
  originalTotal: number; // Original total amount to be paid
  remainingAmount: number; // Running total of remaining amount to be paid
  tip: number; // Additional charges/adjustments
  tipRate: number;
  discount: number;
  surcharges: number[];
  customAmounts: CustomAmount[];
  finalTotal: number; // Final total (original + tip + customAmounts - discount)
  payments: PaymentEntry[]; // Array to track all payment entries
  currentPayment: CurrentPayment; // Current active payment being processed
  splitType: SplitType; // Split payment settings
  splitCount: number;
  splitItems: any[]; // Replace `any` with a specific item type if available
}

export interface SurchargeItem {
  id: number;
  name: string;
  value: string;
  type: number;
  use_type: number;
  auto_add: number;
  day_of_week: number[];
  selected_date: string;
  status: number;
}

export interface AddOn {
  category_id: number;
  id: number;
  name: string;
  price: number; // 0 〜
  quantity: number; // 1 〜
  status: 0 | 1; // 1 = active?
  type: 0 | 1; // 0 = preset, 1 = custom など
}

export interface OrderProduct {
  id: number;
  uuid: string;
  title: string;
  description: string;
  note: string;
  category_id: number;
  status: 0 | 1;
  isCancelled?: boolean;
  is_deleted: boolean;
  is_pop_up: boolean;
  is_printed: 0 | 1;
  quantity: number;
  stock: number;
  price: number;
  price_type: priceType;
  code: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  currentTimestamp: string;
  addOns: AddOn[];
}

export interface DayOption {
  id: number;
  label: string;
  short: string;
}

export interface OtherSurcharge {
  id: number;
  name: string;
  value: string;
  status: number;
  auto_add: number;
  type: number;
  use_type: number;
  day_of_week: number[];
  selected_date: string;
}

export interface NewOtherSurcharge {
  name: string;
  value: string;
  status?: number;
  auto_add?: number;
  type: number;
  use_type?: number;
  day_of_week: number[];
  selected_date: string;
  branch_id?: number | null;
}

export interface CardSurcharge {
  id: number;
  name: string;
  value: string;
  status: number;
  type: number;
  use_windcave: number;
  use_stripe: number;
  use_novatti: number;
  use_worldline: number;
}

export interface NewCardSurcharge {
  name: string;
  value: string;
  status?: number;
  type: number;
  use_windcave?: number;
  use_stripe?: number;
  use_novatti?: number;
  use_worldline?: number;
  branch_id?: number | null;
}

export interface SplitItemAssignment {
  itemUuid: string;
  quantity: number;
  itemTitle: string;
  itemPrice: number;
  addOns: AddOn[];
  totalPrice: number;
}

export type SplitItemAssignments = {
  [splitNumber: number]: SplitItemAssignment[];
};
