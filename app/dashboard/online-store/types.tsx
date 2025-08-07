export interface Product {
  id: number;
  product_id?: string;
  pos_product_category_id: number;
  parent_category: string | null;
  code: string;
  title: string;
  description: string;
  product_name?: string;
  price: number;
  order: number;
  stock: number;
  photo: string;
  photos?: any[];
  category_id: number;
  daily_limit?: number;
  product_desc?: string;
  daily_sold?: number;
  color: string;
  barcode: string;
  product_category_id?: number;
  category_ids: any;
  status: number;
  is_pop_up: number;
  modifiers?: any[];
  option_ids: any[]; // Adjust type based on actual option structure
  is_flow_modifier: number;
  xero_product_uid: string;
  created_at: string; // Consider using Date if you're converting this to a Date object
  updated_at: string; // Consider using Date if you're converting this to a Date object
  reckon_product_uid: string | null;
  reckon_rha_item_list_id: string | null;
  flow_modifiers: any[]; // Adjust based on flow modifier structure
  cost: number;
  notes: string;
  ingredients: Ingredient[];
  images: Array<{
    id: number;
    path: string;
    file_type: string;
  }>;
  name: string;
  pos_product?: any;
  modifier_groups?: any[];
  is_active?: any;
}

export interface ProductDetails {
  productName: string;
  setProductName: (value: string) => void;
  productImage: string;
  setProductImage: (value: string) => void;
  productPrice: string;
  setProductPrice: (value: string) => void;
  productDescription: string;
  setProductDescription: (value: string) => void;
  productCategory: string;
  setProductCategory: (value: string) => void;
}
export interface Ingredient {
  id: number;
  pos_product_inventory_id: number;
  pos_product_id: number;
  pos_product_add_ons_id: number | null;
  quantity: string;
  quantity_unit_id: number;
  measurement_unit_id: number;
  cost: string;
  created_at: string;
  updated_at: string;
  is_enable: number;
  measurement_unit: MeasurementUnit;
  prod_items: ProdItem;
  quantity_unit: MeasurementUnit;
}

export interface MeasurementUnit {
  id: number;
  category: string;
  unit_of_measurement: string;
  abbreviation: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProdItem {
  id: number;
  product_number: string;
  product_name: string;
  sku: string | null;
  colour: string | null;
  stock_unit: string;
  stock_amount: string;
  size: string;
  cost_per_unit: string;
  measurement_desc: string;
  measurement_unit: MeasurementUnit;
  measurement_unit_id: number;
  minimum_level: string;
  par_level_unit: string;
  location_id: number;
  supplier_id: number;
  user_id: number;
  employee_id: number;
  notes: string;
  unit_desc: string;
  unit_desc_id: number;
  order_unit: string;
  order_unit_id: number;
  order_unit_desc: string | null;
  pos_inventory_item_categories_id: number;
  last_cost: string;
  avg_cost: string;
  gst: number;
  is_enable: number;
  barcode: string;
  quantity: string | null;
  created_at: string;
  updated_at: string;
  photo: string;
}
export interface ImageData {
  id: number;
  path: string;
  file_type: string;
  fileable_id: number;
  fileable_type: string;
}

export interface PreviewProps {
  businessProfile: any;
  useLogo: boolean;
  setUseLogo: React.Dispatch<React.SetStateAction<boolean>>;
  imagePreview: ImageData[];
  logoPreview: string;
  uploadLogoData: any;
  setUploadLogoData: React.Dispatch<React.SetStateAction<any>>;
  backgroundColor: string;
  accentColor: string;
  bookNowColor: string;
  selectedFont: string;
  requirePaymentsOnline: boolean;
  setRequirePaymentsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  settingId: number;
  uploadImageData: any;
  setImagePreview: React.Dispatch<React.SetStateAction<ImageData[]>>;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  setAccentColor: React.Dispatch<React.SetStateAction<string>>;
  setBookNowColor: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFont: React.Dispatch<React.SetStateAction<string>>;
  setIsShowOtherVenues: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface OnlineStoreProduct {
  id?: string;
  product_id: string;
  product_name: string;
  product_desc: string;
  price: string;
  category_id: string;
  prep_time: string;
  availability: string;
  unit_barcode: string;
  case_barcode: string;
  modifiers: string[];
}

interface PickupTimeSettings {
  advance_days: number;
  blocked_dates: string[];
  time_slots: {
    start: string;
    end: string;
    interval: number; // in minutes
  };
}

export interface OnlineStoreSettings {
  order_methods: string[];
  payments_online: boolean;
  payments_in_person: boolean;
  use_logo_instead: boolean;
  bg_color: string;
  accent_color: string;
  has_button_font_color: boolean;
  book_now_color: string;
  font: string;
  font_size: string;
  domain: string;
  products: OnlineStoreProduct[];
  notes?: string;
  pickup_date?: string;
  auto_accept_orders: boolean;
  pickup_settings: PickupTimeSettings;
  store_description?: string;
}
