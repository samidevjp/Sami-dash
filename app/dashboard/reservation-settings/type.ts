// types/widgetTypes.ts
import { MV_TYPE } from '@/app/dashboard/reservation-settings/enums-settings';

export interface WidgetPreviewProps {
  businessProfile: any;
  widgetToken: string | undefined;
  imagePreview: Array<ImageData>;
  logoPreview: string;
  uploadImagedata: any;
  setUploadImageData: (value: any) => void;
  deleteImageId: any;
  uploadLogoData: any;
  backgroundColor: string;
  bookNowColor: string;
  accentColor: string;
  selectedFont: string;
  useLogo: boolean;
  description: string;
  requireCreditCard: boolean;
  isShowPopup: boolean;
  isDisplaySectionName: boolean;
  isAllowSectionFilter: boolean;
  isShowOtherVenues: boolean;
  hasButtonFontColour: boolean;
  fetchWidgetBranding: () => void;
  selectedButtonShape: number;
  isRelatedLink?: boolean;
  settingId: number;
  mvType: keyof typeof MV_TYPE;
}

export interface WidgetContainerProps {
  businessProfile: any;
  widgetToken: string | undefined;
}

export interface SettingsProps {
  largeParties: number;
  setLargeParties: React.Dispatch<React.SetStateAction<number>>;
  isLateArrivals: boolean;
  setIsLateArrivals: React.Dispatch<React.SetStateAction<boolean>>;
  isEnableCreditCardDetails: boolean;
  setIsEnableCreditCardDetails: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ImageData {
  id: number;
  path: string;
  file_type: string;
  fileable_id: number;
  fileable_type: string;
}

export interface RelatedLink {
  id?: number;
  widget_branding_id?: number;
  is_visible: number;
  image_url: string;
  title: string;
  description: string;
  link_url: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  is_new?: boolean;
  is_edited?: boolean;
  imageFile?: File;
}

export interface WidgetSettingsProps {
  useLogo: boolean;
  setUseLogo: (value: boolean) => void;
  imagePreview: Array<ImageData>;
  setImagePreview: React.Dispatch<React.SetStateAction<ImageData[]>>;
  uploadImagedata: any;
  setUploadImagedata: (value: any) => void;
  setdeleteImageId: (value: any) => void;
  logoPreview: string;
  setLogoPreview: (value: string) => void;
  setUploadLogoData: (value: any) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  accentColor: string;
  setAccentColor: (value: string) => void;
  bookNowColor: string;
  setBookNowColor: (value: string) => void;
  isResetDesign: boolean;
  setIsResetDesign: (value: boolean) => void;
  previousColors: {
    backgroundColor: string;
    accentColor: string;
    bookNowColor: string;
  };
  setPreviousColors: (value: {
    backgroundColor: string;
    accentColor: string;
    bookNowColor: string;
  }) => void;
  selectedFont: string;
  setSelectedFont: (value: string) => void;
  isShowPopup: boolean;
  setIsShowPopup: (value: boolean) => void;
  isDisplaySectionName: boolean;
  setIsDisplaySectionName: (value: boolean) => void;
  isAllowSectionFilter: boolean;
  setIsAllowSectionFilter: (value: boolean) => void;
  hasButtonFontColour: boolean;
  setHasButtonFontColour: (value: boolean) => void;
  description: string;
  setDescription: (value: string) => void;
  isRelatedLink: boolean;
  setIsRelatedLink: (value: boolean) => void;
  relatedLinks: RelatedLink[];
  setRelatedLinks: React.Dispatch<React.SetStateAction<RelatedLink[]>>;
  selectedButtonShape: number;
  setSelectedButtonShape: (value: number) => void;
  mvType: keyof typeof MV_TYPE;
  setMvType: (value: keyof typeof MV_TYPE) => void;
}

export interface WidgetSaveButtonProps {
  businessProfile: any;
  settingId: number;
  imagePreview: Array<{
    id: number;
    path: string;
    file_type: string;
    fileable_id: number;
    fileable_type: string;
  }>;
  widgetToken: string | undefined;
  uploadImagedata: any;
  setUploadImageData: (value: any) => void;
  deleteImageId: any;
  logoPreview: string;
  uploadLogoData: any;
  backgroundColor: string;
  bookNowColor: string;
  accentColor: string;
  selectedFont: string;
  useLogo: boolean;
  description: string;
  requireCreditCard: boolean;
  // setRequireCreditCard: (value: boolean) => void;
  isShowPopup: boolean;
  isDisplaySectionName: boolean;
  isAllowSectionFilter: boolean;
  isShowOtherVenues: boolean;
  hasButtonFontColour: boolean;
  fetchWidgetBranding: () => Promise<any>;
  isRelatedLink: boolean;

  relatedLinks: RelatedLink[];
  setRelatedLinks: React.Dispatch<React.SetStateAction<RelatedLink[]>>;
  selectedButtonShape: number;
  mvType: keyof typeof MV_TYPE;
}
