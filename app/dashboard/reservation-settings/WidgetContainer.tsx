import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '@/hooks/useApi';
import { Heading } from '@/components/ui/heading';
import TabMenu from './TabMenu';
import PageContainer from '@/components/layout/page-container';
import WidgetSettings from './components/widget/WidgetSettings';
import WidgetPreview from './components/widget/WidgetPreview';
import WidgetSaveButton from './components/widget/WidgetSaveButton';
import SettingPrimaryPanels from './components/settings/SettingPrimaryPanels';
import SettingSecondaryPanels from './components/settings/SettingSecondaryPanels';
import SettingSaveButton from './components/settings/SettingSaveButton';
import FlowControlDateTab from './components/flowControl/FlowControlDateTab';
import FlowControlContainer from './components/flowControl/FlowControlContainer';
import RequestBookingSetting from './components/requestBooking/requestBookingSetting';
import {
  WidgetPreviewProps,
  ImageData,
  RelatedLink,
  SettingsProps,
  WidgetContainerProps
} from '@/app/dashboard/reservation-settings/type';
import {
  DAYS_OF_WEEK_MAP,
  MV_TYPE
} from '@/app/dashboard/reservation-settings/enums-settings';
interface CommonsProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}
const WidgetContainer = ({
  businessProfile,
  widgetToken
}: WidgetContainerProps) => {
  // Common State
  const {
    getWidgetBranding,
    getAccountSettings,
    getPartysizeTurntime,
    widgetSettings,
    getWidgetDaySettings
  } = useApi();
  const [selectedTab, setSelectedTab] =
    useState<CommonsProps['selectedTab']>('widget');
  // Flow controle
  const [widgetSettingsData, setWidgetSettingsData] = useState<any>({});
  const [copiedService, setCopiedService] = React.useState<any>();
  // Settings State
  const [partysizeTurnTime, setPartysizeTurnTime] = useState<any[]>([]);
  const [largeParties, setLargeParties] =
    useState<SettingsProps['largeParties']>(10);
  const [isLateArrivals, setIsLateArrivals] =
    useState<SettingsProps['isLateArrivals']>(false);
  const [isEnableCreditCardDetails, setIsEnableCreditCardDetails] =
    useState<SettingsProps['isEnableCreditCardDetails']>(false);
  const [widgetNoteTitle, setWidgetNoteTitle] = useState<string>('');
  const [widgetNoteMessage, setWidgetNoteMessage] = useState<string>('');
  const [isAllowRequest, setIsAllowRequest] = useState<boolean>(false);
  const [isEmailRequest, setIsEmailRequest] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailText, setEmailText] = useState<string>('');
  const [isAllowRequestCancel, setIsAllowRequestCancel] =
    useState<boolean>(false);
  const [cancellationDuration, setCancellationDuration] = useState<number>(0);
  const [isOnlineAvailability, setIsOnlineAvailability] =
    useState<boolean>(false);
  const [minimumPartySize, setMinimumPartySize] = useState<number>(2);
  const [maximumPartySize, setMaximumPartySize] = useState<number>(10);
  const [createTurnTimeData, setCreateTurnTimeData] = useState<any[]>([]);
  const [deleteTurnTimeData, setDeleteTurnTimeData] = useState<number[]>([]);
  // Widget Settings State
  const [settingId, setSettingId] =
    useState<WidgetPreviewProps['settingId']>(0);
  const [mvType, setMvType] = useState<keyof typeof MV_TYPE>('Cropped');
  const [imagePreview, setImagePreview] = useState<Array<ImageData>>([]);
  const [uploadImagedata, setUploadImagedata] = useState<any>([]);
  const [deleteImageId, setdeleteImageId] = useState<any[]>([]);
  const [useLogo, setUseLogo] = useState<WidgetPreviewProps['useLogo']>(true);
  const [logoPreview, setLogoPreview] =
    useState<WidgetPreviewProps['logoPreview']>('');
  const [uploadLogoData, setUploadLogoData] = useState<
    WidgetPreviewProps['uploadLogoData']
  >([]);

  const [backgroundColor, setBackgroundColor] =
    useState<WidgetPreviewProps['backgroundColor']>('#000000');
  const [accentColor, setAccentColor] =
    useState<WidgetPreviewProps['accentColor']>('#ffffff');
  const [bookNowColor, setBookNowColor] =
    useState<WidgetPreviewProps['bookNowColor']>('#485df9');
  const [isResetDesign, setIsResetDesign] = useState<boolean>(false);
  const [previousColors, setPreviousColors] = useState({
    backgroundColor: '#000000',
    accentColor: '#ffffff',
    bookNowColor: '#485df9'
  });
  const [selectedFont, setSelectedFont] =
    useState<WidgetPreviewProps['selectedFont']>('');
  const [selectedButtonShape, setSelectedButtonShape] =
    useState<WidgetPreviewProps['selectedButtonShape']>(1);
  const [description, setDescription] =
    useState<WidgetPreviewProps['description']>('');
  const [isRelatedLink, setIsRelatedLink] =
    useState<WidgetPreviewProps['isRelatedLink']>(false);
  const [isShowPopup, setIsShowPopup] =
    useState<WidgetPreviewProps['isShowPopup']>(false);
  const [isDisplaySectionName, setIsDisplaySectionName] =
    useState<WidgetPreviewProps['isDisplaySectionName']>(false);
  const [isAllowSectionFilter, setIsAllowSectionFilter] =
    useState<WidgetPreviewProps['isAllowSectionFilter']>(false);
  const [isShowOtherVenues, setIsShowOtherVenues] = useState<boolean>(false);
  const [requireCreditCard, setRequireCreditCard] =
    useState<WidgetPreviewProps['requireCreditCard']>(true);
  const [hasButtonFontColour, setHasButtonFontColour] =
    useState<boolean>(false);
  const [relatedLinks, setRelatedLinks] = useState<RelatedLink[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>();

  const getWidgetDaySettingsFunction = async (isUpdate: boolean) => {
    try {
      const response = await getWidgetDaySettings();
      fetchAllDays(response.widget_day_settings, isUpdate);
    } catch (error) {
      console.error('error', error);
    }
  };
  useEffect(() => {
    getWidgetDaySettingsFunction(false);
  }, []);
  const fetchDay = async (day: number) => {
    try {
      const params = {
        day_number: day
      };
      const response = await widgetSettings(params);
      return { day, fetchedData: response.data.widget_settings };
    } catch (error) {
      console.error(`Error fetching data for day ${day}:`, error);
      return { day, fetchedData: null };
    }
  };
  const fetchAllDays = async (propDaysStatus: any, isUpdate: boolean) => {
    setWidgetSettingsData(
      Object.entries(DAYS_OF_WEEK_MAP).reduce(
        (acc, [key, value]) => {
          acc[parseInt(key)] = { name: value as string, fetchedData: [] };
          return acc;
        },
        {} as { [key: number]: { name: string; [key: string]: any } }
      )
    );
    try {
      // @ts-ignore
      const dayPromises = propDaysStatus.map(({ day_number }) => {
        return fetchDay(day_number);
      });
      const allResults = await Promise.all(dayPromises);
      setWidgetSettingsData((prev: any) => {
        const newData = { ...prev };
        allResults.forEach(({ day, fetchedData }, index) => {
          if (fetchedData !== null) {
            const { day_number, is_open, day_name } = propDaysStatus[index];
            newData[day_number] = {
              ...prev[day_number],
              day: day_number,
              day_name,
              fetchedData,
              is_open
            };
            if (day_number === 1 && isUpdate != true) {
              setSelectedDay(newData[day_number]);
            }
          }
        });
        return newData;
      });
    } catch (error) {
      console.error('Error fetching all days:', error);
    }
  };
  const fetchWidgetBranding = async () => {
    try {
      const widgetBrandingRes = await getWidgetBranding();
      setUseLogo(widgetBrandingRes.useLogo);
      setSettingId(widgetBrandingRes.id);
      setImagePreview(
        widgetBrandingRes?.files?.length > 0
          ? widgetBrandingRes.files.map(
              (file: { id: number; path: string }) => ({
                ...file,
                path: `${process.env.NEXT_PUBLIC_IMG_URL}${file.path}`
              })
            )
          : []
      );
      setLogoPreview(
        widgetBrandingRes.logo
          ? `${process.env.NEXT_PUBLIC_IMG_URL}${widgetBrandingRes.logo}`
          : ''
      );
      const defaultColors = {
        backgroundColor: '#000000',
        accentColor: '#ffffff',
        bookNowColor: '#485df9'
      };
      setBackgroundColor(
        widgetBrandingRes.background_colour || defaultColors.backgroundColor
      );
      setAccentColor(
        widgetBrandingRes.accent_colour || defaultColors.accentColor
      );
      setBookNowColor(
        widgetBrandingRes.book_now_colour || defaultColors.bookNowColor
      );
      setSelectedFont(widgetBrandingRes.font || 'Arial');
      setRequireCreditCard(widgetBrandingRes.require_credit_credentials === 1);
      setIsShowPopup(widgetBrandingRes.pop_up_wabi_posts === 1);
      setIsDisplaySectionName(widgetBrandingRes.display_section_name === 1);
      setIsAllowSectionFilter(widgetBrandingRes.enable_section_filter === 1);
      setIsShowOtherVenues(widgetBrandingRes.display_other_venues === 1);
      setDescription(widgetBrandingRes.description || 'enter description');
      setUseLogo(widgetBrandingRes.show_logo === 1);
      setIsRelatedLink(widgetBrandingRes.use_related_links === 1);
      setRelatedLinks(widgetBrandingRes.related_links || []);
      setSelectedButtonShape(widgetBrandingRes.button_type || 1);
      setMvType(widgetBrandingRes.mv_type || 0);
      return widgetBrandingRes;
    } catch (error) {
      console.error('Error fetching widget branding:', error);
      throw error;
    }
  };

  const fetchAccountSettings = async () => {
    try {
      const accountSettingsRes = await getAccountSettings();
      setLargeParties(accountSettingsRes.setting.large_party_count);
      setIsLateArrivals(accountSettingsRes.setting.late_arrivals);
      setIsEnableCreditCardDetails(
        accountSettingsRes.setting.online_booking_payment
      );
      setWidgetNoteTitle(accountSettingsRes.setting.widget_note_title || '');
      setWidgetNoteMessage(
        accountSettingsRes.setting.widget_note_message || ''
      );
      setIsAllowRequest(accountSettingsRes.setting.allow_guest_request);
      setIsEmailRequest(
        accountSettingsRes.setting.allow_automatically_sent_email
      );
      setEmailSubject(
        accountSettingsRes.setting.email_subject ||
          'Request Received – We’ll Get Back to You Soon'
      );
      setEmailText(
        accountSettingsRes.setting.email_text ||
          'Thank you for your request. We have received it and will process it as soon as possible.Our team will review your request and get back to you within three business days. If you have any urgent concerns, please feel free to contact us at [contact email/phone number].We appreciate your patience and will do our best to assist you.'
      );
      setIsAllowRequestCancel(
        accountSettingsRes.setting.allow_guest_request_cancel_reservation
      );
      setCancellationDuration(
        accountSettingsRes.setting
          .allow_guest_request_cancel_reservation_duration
      );
      setIsOnlineAvailability(accountSettingsRes.setting.online_available);
      setMinimumPartySize(
        accountSettingsRes.setting.online_available_booking_min
      );
      setMaximumPartySize(
        accountSettingsRes.setting.online_available_booking_max
      );
    } catch (error) {
      console.error('Error fetching account settings:', error);
    }
  };
  const fetchPartysizeTurnTime = async () => {
    try {
      const partysizeTurnTimeRes = await getPartysizeTurntime();
      setPartysizeTurnTime(partysizeTurnTimeRes);
    } catch (error) {
      console.error('Error fetching party size turn time:', error);
    }
  };
  const asyncFunction = async () => {
    await fetchWidgetBranding();
    await fetchAccountSettings();
    await fetchPartysizeTurnTime();
  };
  useEffect(() => {
    asyncFunction();
  }, []);

  const widgetPreviewRef = useRef<HTMLDivElement>(null);

  const handleScrollToWidgetPreview = () => {
    if (widgetPreviewRef.current) {
      widgetPreviewRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchPartysizeTurnTimeWithRetry = async (retries = 5, delay = 1000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const partysizeTurnTimeRes = await getPartysizeTurntime();
        if (
          Array.isArray(partysizeTurnTimeRes) &&
          partysizeTurnTimeRes.length > 0
        ) {
          setPartysizeTurnTime(partysizeTurnTimeRes);
          return;
        }
        throw new Error('Empty or invalid response');
      } catch (error) {
        console.error(`Fetch attempt ${attempt + 1} failed:`, error);
        if (attempt === retries - 1) {
          console.error('Failed to fetch party size turn time after retries');
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };
  return (
    <>
      <PageContainer scrollable>
        <div className="mb-4 ml-8">
          {selectedTab === 'widget' && (
            <Heading
              title={`Widget`}
              description="Manage your widget"
              titleClass="text-xl"
              descriptionClass="text-sm"
            />
          )}
          {selectedTab === 'settings' && (
            <Heading
              title={`Settings`}
              description="Manage your settings"
              titleClass="text-xl"
              descriptionClass="text-sm"
            />
          )}
          {selectedTab === 'flow-control' && (
            <Heading
              title={`Flow control`}
              description="Manage your Flow control"
              titleClass="text-xl"
              descriptionClass="text-sm"
            />
          )}
          {selectedTab === 'request-booking' && (
            <Heading
              title={`Request Booking`}
              description="Manage your Request Booking"
              titleClass="text-xl"
              descriptionClass="text-sm"
            />
          )}
        </div>
        <div className="border-b pl-4">
          <TabMenu setSelectedTab={setSelectedTab} />
        </div>
        {selectedTab === 'widget' && (
          <div className="">
            <div className="mx-auto mb-12 lg:grid lg:grid-cols-2">
              <div className="p-6 lg:max-h-[calc(100vh-240px)] lg:overflow-y-scroll">
                <WidgetSettings
                  imagePreview={imagePreview}
                  setImagePreview={setImagePreview}
                  uploadImagedata={uploadImagedata}
                  setUploadImagedata={setUploadImagedata}
                  setdeleteImageId={setdeleteImageId}
                  logoPreview={logoPreview}
                  setLogoPreview={setLogoPreview}
                  setUploadLogoData={setUploadLogoData}
                  useLogo={useLogo}
                  setUseLogo={setUseLogo}
                  backgroundColor={backgroundColor}
                  setBackgroundColor={setBackgroundColor}
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  bookNowColor={bookNowColor}
                  setBookNowColor={setBookNowColor}
                  isResetDesign={isResetDesign}
                  setIsResetDesign={setIsResetDesign}
                  previousColors={previousColors}
                  setPreviousColors={setPreviousColors}
                  selectedFont={selectedFont}
                  description={description}
                  setDescription={setDescription}
                  setSelectedFont={setSelectedFont}
                  isShowPopup={isShowPopup}
                  setIsShowPopup={setIsShowPopup}
                  isDisplaySectionName={isDisplaySectionName}
                  setIsDisplaySectionName={setIsDisplaySectionName}
                  isAllowSectionFilter={isAllowSectionFilter}
                  setIsAllowSectionFilter={setIsAllowSectionFilter}
                  // isShowOtherVenues={isShowOtherVenues}
                  // setIsShowOtherVenues={setIsShowOtherVenues}
                  hasButtonFontColour={hasButtonFontColour}
                  setHasButtonFontColour={setHasButtonFontColour}
                  isRelatedLink={isRelatedLink ?? false}
                  setIsRelatedLink={setIsRelatedLink}
                  relatedLinks={relatedLinks}
                  setRelatedLinks={setRelatedLinks}
                  selectedButtonShape={selectedButtonShape}
                  setSelectedButtonShape={setSelectedButtonShape}
                  mvType={mvType}
                  setMvType={setMvType}
                />
              </div>

              <div
                className="p-6 lg:max-h-[calc(100vh-240px)] lg:overflow-y-scroll"
                ref={widgetPreviewRef}
              >
                <WidgetPreview
                  accentColor={accentColor}
                  backgroundColor={backgroundColor}
                  bookNowColor={bookNowColor}
                  businessProfile={businessProfile}
                  deleteImageId={deleteImageId}
                  description={description}
                  fetchWidgetBranding={fetchWidgetBranding}
                  hasButtonFontColour={hasButtonFontColour}
                  imagePreview={imagePreview}
                  isAllowSectionFilter={isAllowSectionFilter}
                  isDisplaySectionName={isDisplaySectionName}
                  isShowOtherVenues={isShowOtherVenues}
                  isShowPopup={isShowPopup}
                  logoPreview={logoPreview}
                  requireCreditCard={requireCreditCard}
                  selectedFont={selectedFont}
                  settingId={settingId}
                  setUploadImageData={setUploadImagedata}
                  uploadImagedata={uploadImagedata}
                  uploadLogoData={uploadLogoData}
                  useLogo={useLogo}
                  widgetToken={widgetToken}
                  selectedButtonShape={selectedButtonShape}
                  mvType={mvType}
                />
              </div>
            </div>
            <div className="sticky bottom-0 right-0 z-30 flex w-full justify-center bg-background py-8">
              <WidgetSaveButton
                businessProfile={businessProfile}
                widgetToken={widgetToken}
                settingId={settingId}
                imagePreview={imagePreview}
                uploadImagedata={uploadImagedata}
                setUploadImageData={setUploadImagedata}
                deleteImageId={deleteImageId}
                logoPreview={logoPreview}
                useLogo={useLogo}
                uploadLogoData={uploadLogoData}
                backgroundColor={backgroundColor}
                accentColor={accentColor}
                bookNowColor={bookNowColor}
                selectedFont={selectedFont}
                description={description}
                requireCreditCard={requireCreditCard}
                // setRequireCreditCard={setRequireCreditCard}
                isShowPopup={isShowPopup}
                isDisplaySectionName={isDisplaySectionName}
                isAllowSectionFilter={isAllowSectionFilter}
                isShowOtherVenues={isShowOtherVenues}
                hasButtonFontColour={hasButtonFontColour}
                fetchWidgetBranding={fetchWidgetBranding}
                isRelatedLink={isRelatedLink ?? false}
                relatedLinks={relatedLinks}
                setRelatedLinks={setRelatedLinks}
                selectedButtonShape={selectedButtonShape}
                mvType={mvType}
              />
            </div>

            <button
              className="fixed bottom-24 right-4 z-40 flex h-16 w-16 flex-col items-center justify-center rounded-full border bg-secondary text-white shadow-md lg:hidden "
              onClick={handleScrollToWidgetPreview}
            >
              <p className="text-xs">Preview</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 9l4 4 4-4"
                />
              </svg>
            </button>
          </div>
        )}
        {selectedTab === 'settings' && (
          <div className="">
            <div className="mx-auto mb-12 grid-cols-2 lg:grid">
              <div className="md:p-6 lg:max-h-[calc(100vh-240px)] lg:overflow-y-scroll lg:border-r">
                <SettingPrimaryPanels
                  largeParties={largeParties}
                  isLateArrivals={isLateArrivals}
                  isEnableCreditCardDetails={isEnableCreditCardDetails}
                  setLargeParties={setLargeParties}
                  setIsLateArrivals={setIsLateArrivals}
                  setIsEnableCreditCardDetails={setIsEnableCreditCardDetails}
                  partysizeTurnTime={partysizeTurnTime}
                  setPartysizeTurnTime={setPartysizeTurnTime}
                  createTurnTimeData={createTurnTimeData}
                  setCreateTurnTimeData={setCreateTurnTimeData}
                  setDeleteTurnTimeData={setDeleteTurnTimeData}
                />
              </div>
              <div className="md:p-6 lg:max-h-[calc(100vh-240px)] lg:overflow-y-scroll">
                <SettingSecondaryPanels
                  largeParties={largeParties}
                  isLateArrivals={isLateArrivals}
                  isEnableCreditCardDetails={isEnableCreditCardDetails}
                  widgetNoteTitle={widgetNoteTitle}
                  setWidgetNoteTitle={setWidgetNoteTitle}
                  widgetNoteMessage={widgetNoteMessage}
                  setWidgetNoteMessage={setWidgetNoteMessage}
                  isAllowRequest={isAllowRequest}
                  setIsAllowRequest={setIsAllowRequest}
                  emailSubject={emailSubject}
                  setEmailSubject={setEmailSubject}
                  isEmailRequest={isEmailRequest}
                  setIsEmailRequest={setIsEmailRequest}
                  emailText={emailText}
                  setEmailText={setEmailText}
                  isAllowRequestCancel={isAllowRequestCancel}
                  setIsAllowRequestCancel={setIsAllowRequestCancel}
                  cancellationDuration={cancellationDuration}
                  setCancellationDuration={setCancellationDuration}
                  isOnlineAvailability={isOnlineAvailability}
                  setIsOnlineAvailability={setIsOnlineAvailability}
                  minimumPartySize={minimumPartySize}
                  setMinimumPartySize={setMinimumPartySize}
                  maximumPartySize={maximumPartySize}
                  setMaximumPartySize={setMaximumPartySize}
                  createTurnTimeData={createTurnTimeData}
                  setCreateTurnTimeData={setCreateTurnTimeData}
                  deleteTurnTimeData={deleteTurnTimeData}
                  setDeleteTurnTimeData={setDeleteTurnTimeData}
                  fetchPartysizeTurnTimeWithRetry={
                    fetchPartysizeTurnTimeWithRetry
                  }
                />
              </div>
            </div>
            <div className="sticky bottom-0 right-0 z-30 flex w-full justify-center bg-background py-8">
              <SettingSaveButton
                largeParties={largeParties}
                isLateArrivals={isLateArrivals}
                isEnableCreditCardDetails={isEnableCreditCardDetails}
                widgetNoteTitle={widgetNoteTitle}
                widgetNoteMessage={widgetNoteMessage}
                isAllowRequest={isAllowRequest}
                emailSubject={emailSubject}
                isEmailRequest={isEmailRequest}
                emailText={emailText}
                isAllowRequestCancel={isAllowRequestCancel}
                cancellationDuration={cancellationDuration}
                isOnlineAvailability={isOnlineAvailability}
                minimumPartySize={minimumPartySize}
                maximumPartySize={maximumPartySize}
                createTurnTimeData={createTurnTimeData}
                setCreateTurnTimeData={setCreateTurnTimeData}
                deleteTurnTimeData={deleteTurnTimeData}
                setDeleteTurnTimeData={setDeleteTurnTimeData}
                fetchPartysizeTurnTimeWithRetry={
                  fetchPartysizeTurnTimeWithRetry
                }
              />
            </div>
          </div>
        )}
        {selectedTab === 'flow-control' && (
          <div className="flex">
            <FlowControlDateTab
              widgetSettingsData={widgetSettingsData}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
            />
            <FlowControlContainer
              fetchDay={fetchDay}
              getWidgetDaySettingsFunction={getWidgetDaySettingsFunction}
              widgetSettingsData={widgetSettingsData}
              setWidgetSettingsData={setWidgetSettingsData}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              isDayActivated={true}
              copiedService={copiedService}
              setCopiedService={setCopiedService}
            />
          </div>
        )}
        {selectedTab === 'request-booking' && <RequestBookingSetting />}
      </PageContainer>
    </>
  );
};
export default WidgetContainer;
