export interface ContainerProps {
  entitySearch: any;
  setEntitySearch: React.Dispatch<React.SetStateAction<any>>;
  fetchEntitySearch: () => void;
}
export interface ContentProps {
  id: number;
  title: string;
  date: string;
  description: string;
  data: any;
  slug: string;
}
export interface EditorContentProps {
  selectedContent: any;
  selectedTab: string;
  isOpen: boolean;
  onClose: () => void;
  entitySearch: any;
  setEntitySearch: React.Dispatch<React.SetStateAction<any>>;
  fetchEntitySearch: () => void;
  hasStripeAccount?: boolean;
}
export interface PostFeildProps {
  isCanBook: boolean;
}
export interface ExperienceStateProps {
  id: number;
  user_id: number;
  slug: string;
  exp_name: string;
  exp_description: string;
  price: number;
  no_of_ticket: number;
  status: number;
  experience_shift_connection: {
    id: number;
    shift_id: number;
    experience_id: number;
    floors: null | any;
    day_of_week: number[];
    booking_fee: number;
    flat_rate: number;
    start_date: string;
    end_date: string;
    recurring_type: number;
    recurring_value: number;
    widget_service_ids: number[];
  };
  files: {
    id: number;
    path: string;
    fileType: string;
  }[];
}
export interface ExperienceFieldProps {
  isOpen: boolean;
  ticketLimit: number;
  setTicketLimit: React.Dispatch<React.SetStateAction<number>>;
  ticketPrice: number;
  setTicketPrice: React.Dispatch<React.SetStateAction<number>>;
  experienceStartDate: Date | null;
  setExperienceStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  experienceEndDate: Date | null;
  setExperienceEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  experienceBookingFee: number;
  setExperienceBookingFee: React.Dispatch<React.SetStateAction<number>>;
  experienceFlatRate: number;
  setExperienceFlatRate: React.Dispatch<React.SetStateAction<number>>;
  experienceUntilTime: number;
  setExperienceUntilTime: React.Dispatch<React.SetStateAction<number>>;
  isReccuring: boolean;
  setIsReccuring: React.Dispatch<React.SetStateAction<boolean>>;
  experienceRecurringType: number;
  setExperienceRecurringType: React.Dispatch<React.SetStateAction<number>>;
  experienceRecurringValue: number;
  setExperienceRecurringValue: React.Dispatch<React.SetStateAction<number>>;
  experienceDayOfWeek: number[];
  setExperienceDayOfWeek: React.Dispatch<React.SetStateAction<number[]>>;
  experienceFloor: any;
  setExperienceFloor: React.Dispatch<React.SetStateAction<any>>;
  experienceWidgetServiceIds: number[];
  setExperienceWidgetServiceIds: React.Dispatch<React.SetStateAction<number[]>>;
}
export interface TicketFieldProps {
  totalTickets: number;
  setTotalTickets: React.Dispatch<React.SetStateAction<number>>;
  startSellDate: Date | null;
  setStartSellDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endSellDate: Date | null;
  setEndSellDate: React.Dispatch<React.SetStateAction<Date | null>>;
  eventDate: Date | null;
  setEventDate: React.Dispatch<React.SetStateAction<Date | null>>;
  expirationDate: Date | null;
  setExpirationDate: React.Dispatch<React.SetStateAction<Date | null>>;
  ticketOptions: any[];
  setTicketOptions: React.Dispatch<React.SetStateAction<any[]>>;
}
export interface TicketOption {
  id: string;
  name: string;
  limit: number;
  price: number;
  is_active: boolean;
  validityFrom: string;
  validityTo: string;
  is_new?: boolean;
}
export interface TicketState {
  totalTickets: number;
  startSellDate: Date | null;
  endSellDate: Date | null;
  eventDate: Date | null;
  expirationDate: Date | null;
}
