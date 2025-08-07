import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  Monitor,
  ClipboardCopy,
  MapPin,
  Calendar,
  Clock4
} from 'lucide-react';
import wabiLogo from '@/public/WhiteLogo.png';
import Image from 'next/image';
import Carousel from './Carousel';
import { WidgetPreviewProps } from '@/app/dashboard/reservation-settings/type';
import { BUTTON_SHAPE_CLASSES } from '@/app/dashboard/reservation-settings/enums-settings';
const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  businessProfile,
  widgetToken,
  imagePreview,
  logoPreview,
  backgroundColor,
  accentColor,
  bookNowColor,
  selectedFont,
  useLogo,
  description,
  isDisplaySectionName,
  isAllowSectionFilter,
  hasButtonFontColour,
  selectedButtonShape,
  mvType
}) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [widgetLink, setWidgetLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isPcViewModalVisible, setPcViewModalVisible] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const link = process.env.NEXT_PUBLIC_WIDGET_LINK + '/v2/' + widgetToken;
    setWidgetLink(link);
  }, []);
  const handleViewToggle = (mode: 'mobile' | 'desktop') => {
    setViewMode(mode);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(widgetLink);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 1000);
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const timeSlots = [
    { time: '02:00 PM', label: 'Rooftop' },
    { time: '02:30 PM', label: 'Ground' },
    { time: '03:00 PM', label: 'Middle' },
    { time: '03:30 PM', label: 'Ground' },
    { time: '04:00 PM', label: 'Rooftop' },
    { time: '04:30 PM', label: 'Ground' }
  ];

  // SP View Modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  // PC View Modal
  const togglePcViewModal = () => {
    setPcViewModalVisible(!isPcViewModalVisible);
  };

  return (
    <div>
      {/* Switch Prevew ----------------- */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-md font-semibold">PREVIEW</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleViewToggle('mobile')}
            className={`rounded-lg p-2 ${
              viewMode === 'mobile' ? 'bg-gray-500' : 'bg-gray-700'
            }`}
          >
            <Smartphone size={20} className="text-white" />
          </button>
          <button
            onClick={() => handleViewToggle('desktop')}
            className={`rounded-lg p-2 ${
              viewMode === 'desktop' ? 'bg-gray-500' : 'bg-gray-700'
            }`}
          >
            <Monitor size={20} className="text-white" />
          </button>
        </div>
      </div>
      {/* Copy Link --------------------- */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4">
        <div className="">
          <p className="text-xs font-bold">Widget Link</p>
          <p className="text-xs text-gray-400">{widgetLink}</p>
        </div>
        <div className="relative flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-xs text-white"
          >
            Copy Link <ClipboardCopy size={16} />
          </button>
          {linkCopied && (
            <p className="absolute right-0 top-[-25px] rounded-lg bg-gray-500 p-1 text-center text-xs text-white opacity-90">
              Copied!
            </p>
          )}
        </div>
      </div>
      {/* // Preview ------------------------------------------------------- */}
      <div className="flex justify-center p-6">
        <div
          className={`relative mb-4 w-full transition-all duration-500 ${
            viewMode === 'mobile'
              ? ' max-w-64'
              : ' relative w-full max-w-full  md:max-w-[500px]'
          }`}
        >
          <div className="relative">
            <div className="relative flex items-center justify-center">
              <div className="flex h-auto w-full max-w-lg items-center justify-center rounded-3xl bg-bezel  p-3 shadow-[0_4px_15px_rgba(0,0,0,0.25)]">
                {viewMode === 'mobile' ? (
                  <div
                    className="relative top-0 z-30 overflow-hidden rounded-3xl"
                    style={{ width: '100%', height: '100%' }}
                    {...(isModalVisible ? { onClick: toggleModal } : {})}
                  >
                    <div
                      className="inset-0 flex flex-col rounded-lg"
                      style={{
                        backgroundColor: backgroundColor,
                        height: '100%',
                        fontFamily: selectedFont
                      }}
                    >
                      <div className="relative flex h-[220px] w-full items-center justify-center bg-gray-400">
                        <Carousel
                          imagePreview={imagePreview}
                          businessProfile={businessProfile}
                          mvType={mvType}
                        />
                        {useLogo && logoPreview && (
                          <div className="absolute left-2 top-2 z-30 h-8 w-8 overflow-hidden rounded-full bg-gray-400  shadow-sm">
                            <img
                              src={
                                logoError ? '/placeholder-img.png' : logoPreview
                              }
                              alt=""
                              className="h-full w-full object-cover"
                              onError={handleLogoError}
                            />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 z-30 w-full bg-gradient-to-t from-black/50 to-transparent p-2 pt-4 text-white">
                          <h3 className="text-xs font-bold">
                            {businessProfile.business_name}
                          </h3>
                        </div>
                      </div>
                      <div className="h-32 overflow-hidden p-2">
                        <p
                          className="mb-2"
                          style={{ fontSize: '0.6rem', color: accentColor }}
                        >
                          {businessProfile.address} - {businessProfile.phone_no}
                        </p>
                        <p style={{ fontSize: '0.6rem', color: accentColor }}>
                          {description}
                        </p>
                      </div>
                      <div className="mx-2 mt-4 pb-12">
                        <div className="flex items-center">
                          <MapPin
                            size={16}
                            className="mr-1"
                            style={{
                              color: accentColor
                            }}
                          />
                          <div
                            style={{ fontSize: '0.6rem', color: accentColor }}
                          >
                            <p>{businessProfile.business_name}</p>
                            <p>{businessProfile.address}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-backgound absolute bottom-0 w-full p-2">
                        <button
                          className="w-full rounded-full p-2 text-xs font-bold"
                          style={{
                            backgroundColor: bookNowColor,
                            color: !hasButtonFontColour ? '#fff' : accentColor
                          }}
                          onClick={toggleModal}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                    {/* Modal */}
                    <div
                      className={` absolute bottom-0 z-50 w-full transform p-4 transition-transform duration-300 ease-in-out ${
                        isModalVisible ? 'translate-y-0' : 'translate-y-full'
                      }`}
                      style={{
                        backgroundColor: backgroundColor,
                        height: '70%'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative w-full rounded-t-lg">
                        <div
                          className="absolute left-0.5 top-0 h-1 w-12 cursor-pointer rounded-md"
                          style={{
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: accentColor
                          }}
                          onClick={toggleModal}
                        ></div>
                        <div className="mb-2 flex justify-between pt-4">
                          <h3
                            className=""
                            style={{ fontSize: '0.4rem', color: accentColor }}
                          >
                            Make Reservation At {businessProfile.business_name}
                          </h3>
                          <Image
                            src={wabiLogo}
                            alt="wabi"
                            width={20}
                            height={20}
                            style={{ width: '20px', height: '100%' }}
                          />
                        </div>
                        <div className="w-full" style={{ color: accentColor }}>
                          {/* Party Size */}
                          <div className="my-1 flex items-center justify-between">
                            <div>
                              <p className="" style={{ fontSize: '0.6rem' }}>
                                Party Size
                              </p>
                              <p className="" style={{ fontSize: '0.8rem' }}>
                                2 Guests
                              </p>
                            </div>
                            <div
                              className="flex space-x-2"
                              style={{ fontSize: '1.2rem' }}
                            >
                              <div className="mr-1">-</div>
                              <div className="">+</div>
                            </div>
                          </div>
                          <hr style={{ borderColor: accentColor }} />
                          {/* Date */}
                          <div className="my-1 flex items-center justify-between">
                            <div>
                              <p className="" style={{ fontSize: '0.6rem' }}>
                                Date
                              </p>
                              <p className="" style={{ fontSize: '0.8rem' }}>
                                Mon, Sep 23
                              </p>
                            </div>
                            <Calendar
                              size={16}
                              style={{ color: accentColor }}
                            />
                          </div>
                          <hr style={{ borderColor: accentColor }} />
                          {/* Time */}
                          <div className="my-1 flex items-center justify-between">
                            <div>
                              <p className="" style={{ fontSize: '0.6rem' }}>
                                Time
                              </p>
                              <p className="" style={{ fontSize: '0.8rem' }}>
                                02:00 PM
                              </p>
                            </div>
                            <Clock4 size={16} style={{ color: accentColor }} />
                          </div>
                          <hr style={{ borderColor: accentColor }} />
                          {/* Section floor */}
                          {isAllowSectionFilter && (
                            <>
                              <div className="my-1 flex items-center justify-between">
                                <div>
                                  <p
                                    className=""
                                    style={{ fontSize: '0.6rem' }}
                                  >
                                    Floor
                                  </p>
                                  <p
                                    className="text-center"
                                    style={{ fontSize: '0.8rem' }}
                                  >
                                    All Floors
                                  </p>
                                </div>
                              </div>
                              <hr style={{ borderColor: accentColor }} />
                            </>
                          )}
                        </div>
                        <div
                          className="mt-4 grid grid-cols-3 gap-2 whitespace-nowrap"
                          style={{ borderColor: accentColor }}
                        >
                          {timeSlots.map((slot, index) => (
                            <div
                              key={index}
                              className={`border px-1 py-1 text-center leading-3 ${BUTTON_SHAPE_CLASSES[selectedButtonShape]}`}
                              style={{
                                color: accentColor,
                                borderColor: accentColor
                              }}
                            >
                              <p
                                className="font-bold"
                                style={{ fontSize: '0.55rem' }}
                              >
                                {slot.time}
                              </p>
                              {isDisplaySectionName && (
                                <p style={{ fontSize: '0.35rem' }}>
                                  {slot.label}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Desktop View
                  <div
                    className="relative h-[45vw] w-full overflow-hidden rounded-2xl lg:h-[340px]"
                    style={{
                      backgroundColor: backgroundColor
                    }}
                    {...(isPcViewModalVisible
                      ? { onClick: togglePcViewModal }
                      : {})}
                  >
                    <div className="relative h-full">
                      {isPcViewModalVisible && (
                        <div
                          className="absolute inset-0 z-40 bg-black bg-opacity-50"
                          onClick={togglePcViewModal}
                        />
                      )}
                      <div
                        className={`relative flex h-[24vw] w-[70vw] items-center justify-center 
      overflow-hidden bg-gray-400 lg:h-[150px] lg:w-full`}
                        style={{
                          backgroundColor: imagePreview ? 'transparent' : ''
                        }}
                      >
                        <Carousel
                          imagePreview={imagePreview}
                          businessProfile={businessProfile}
                          mvType={mvType}
                        />
                        {logoPreview && (
                          <div className="absolute left-2 top-2 z-30 h-8 w-8 overflow-hidden rounded-full bg-gray-400 shadow-sm">
                            <img
                              src={
                                logoError ? '/placeholder-img.png' : logoPreview
                              }
                              alt=""
                              className="h-full w-full object-cover"
                              onError={handleLogoError}
                            />
                          </div>
                        )}
                      </div>
                      <div className="mx-4 my-6">
                        <div className="flex justify-between">
                          <div
                            className=""
                            style={{
                              color: accentColor,
                              fontFamily: selectedFont
                            }}
                          >
                            <h3 className="text-xl font-bold">
                              {businessProfile.business_name}
                            </h3>
                            <div className="h-10">
                              <p style={{ fontSize: '0.6rem' }}>
                                {businessProfile.address} -{' '}
                                {businessProfile.phone_no}
                              </p>
                              <p style={{ fontSize: '0.6rem' }}>
                                {description}
                              </p>
                            </div>
                          </div>
                          <div className="">
                            {/* Box */}
                            <div
                              className="w-32 max-w-xs rounded-lg border p-2"
                              style={{
                                borderColor: accentColor,
                                color: accentColor
                              }}
                            >
                              <div className="mb-1 flex justify-between">
                                <h4
                                  className="font-semibold"
                                  style={{
                                    fontSize: '0.2rem'
                                  }}
                                >
                                  Make Reservation At{' '}
                                  {businessProfile.business_name}
                                </h4>
                                <Image
                                  src={wabiLogo}
                                  width={20}
                                  height={20}
                                  alt="wabi"
                                  style={{ width: '20px', height: '100%' }}
                                />
                              </div>
                              {/* Party Size */}
                              <div
                                className="mb-1 flex items-center justify-between border-b"
                                style={{
                                  fontSize: '0.6rem',
                                  borderColor: accentColor
                                }}
                              >
                                <div className="">
                                  <p
                                    style={{
                                      fontSize: '0.2rem'
                                    }}
                                  >
                                    Party Size
                                  </p>
                                  <p
                                    style={{
                                      fontSize: '0.5rem'
                                    }}
                                  >
                                    2 Guests
                                  </p>
                                </div>
                                <div
                                  className="flex items-center space-x-2"
                                  style={{ color: accentColor }}
                                >
                                  <span className="">-</span>
                                  <span className="">+</span>
                                </div>
                              </div>
                              {/* Date Picker */}
                              <div
                                className="mb-1 flex items-center justify-between border-b"
                                style={{
                                  fontSize: '0.5rem',
                                  borderColor: accentColor
                                }}
                              >
                                <div className="">
                                  <p
                                    style={{
                                      fontSize: '0.2rem'
                                    }}
                                  >
                                    Date
                                  </p>
                                  <p
                                    style={{
                                      fontSize: '0.5rem'
                                    }}
                                  >
                                    Mon, Sep 23
                                  </p>
                                </div>
                                <Calendar size={10} />
                              </div>
                              {/* Time Picker */}
                              <div
                                className="mb-1 flex items-center justify-between border-b"
                                style={{
                                  fontSize: '0.5rem',
                                  borderColor: accentColor
                                }}
                              >
                                <div className="">
                                  <p
                                    style={{
                                      fontSize: '0.2rem'
                                    }}
                                  >
                                    Time
                                  </p>
                                  <p
                                    style={{
                                      fontSize: '0.5rem'
                                    }}
                                  >
                                    06:15PM
                                  </p>
                                </div>
                                <Clock4 size={10} />
                              </div>
                              {isAllowSectionFilter && (
                                <>
                                  <div className="my-1 flex items-center justify-between">
                                    <div>
                                      <p
                                        className=""
                                        style={{ fontSize: '0.2rem' }}
                                      >
                                        Floor
                                      </p>
                                      <p
                                        className="text-center"
                                        style={{ fontSize: '0.5rem' }}
                                      >
                                        All Floors
                                      </p>
                                    </div>
                                  </div>
                                  <hr style={{ borderColor: accentColor }} />
                                </>
                              )}
                              {/* Book Now Button */}
                              <button
                                className="w-full rounded-full py-1 font-semibold text-white"
                                style={{
                                  backgroundColor: bookNowColor,
                                  color: !hasButtonFontColour
                                    ? '#fff'
                                    : accentColor,
                                  fontSize: '0.4rem',
                                  fontFamily: selectedFont
                                }}
                                onClick={togglePcViewModal}
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Modal */}
                      <div
                        className={`absolute left-1/2 top-1/2 z-50 w-[50%] transform rounded-sm p-3 transition-transform duration-300 ease-in-out ${
                          isPcViewModalVisible
                            ? 'translate-x-0 translate-y-0 opacity-100'
                            : 'translate-x-full translate-y-full opacity-0'
                        }`}
                        style={{
                          backgroundColor: backgroundColor,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative w-full rounded-t-lg">
                          <div className="flex justify-between">
                            <h3
                              className="mb-2"
                              style={{
                                fontSize: '0.4rem',
                                color: accentColor
                              }}
                            >
                              Make Reservation At{' '}
                              {businessProfile.business_name}
                            </h3>
                            <Image
                              src={wabiLogo}
                              width={20}
                              height={20}
                              alt="wabi"
                              style={{ width: '20px', height: '100%' }}
                            />
                          </div>
                          <div
                            className="w-full"
                            style={{ color: accentColor }}
                          >
                            {/* Party Size */}
                            <div className="my-1 flex items-center justify-between">
                              <div>
                                <p className="" style={{ fontSize: '0.4rem' }}>
                                  Party Size
                                </p>
                                <p className="" style={{ fontSize: '0.6rem' }}>
                                  2 Guests
                                </p>
                              </div>
                              <div
                                className="flex space-x-2"
                                style={{ fontSize: '0.8rem' }}
                              >
                                <div className="mr-1">-</div>
                                <div className="">+</div>
                              </div>
                            </div>
                            <hr style={{ borderColor: accentColor }} />{' '}
                            {/* Date */}
                            <div className="my-1 flex items-center justify-between">
                              <div>
                                <p className="" style={{ fontSize: '0.4rem' }}>
                                  Date
                                </p>
                                <p className="" style={{ fontSize: '0.6rem' }}>
                                  Mon, Sep 23
                                </p>
                              </div>
                              <Calendar
                                style={{ color: accentColor }}
                                size={12}
                              />
                            </div>
                            <hr style={{ borderColor: accentColor }} />
                            {/* Time */}
                            <div className="my-1 flex items-center justify-between">
                              <div>
                                <p className="" style={{ fontSize: '0.4rem' }}>
                                  Time
                                </p>
                                <p className="" style={{ fontSize: '0.6rem' }}>
                                  02:00 PM
                                </p>
                              </div>
                              <Clock4
                                style={{ color: accentColor }}
                                size={12}
                              />
                            </div>
                            <hr style={{ borderColor: accentColor }} />
                            {/* Section floor */}
                            {isAllowSectionFilter && (
                              <>
                                <div className="my-1 flex items-center justify-between">
                                  <div>
                                    <p
                                      className=""
                                      style={{ fontSize: '0.4rem' }}
                                    >
                                      Floor
                                    </p>
                                    <p
                                      className="text-center"
                                      style={{ fontSize: '0.6rem' }}
                                    >
                                      All Floors
                                    </p>
                                  </div>
                                </div>
                                <hr style={{ borderColor: accentColor }} />
                              </>
                            )}
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-1 whitespace-nowrap">
                            {timeSlots.map((slot, index) => (
                              <div
                                key={index}
                                className={`border px-1 py-1 text-center leading-3 ${BUTTON_SHAPE_CLASSES[selectedButtonShape]}`}
                                style={{
                                  color: accentColor,
                                  borderColor: accentColor
                                }}
                              >
                                <p
                                  className="font-bold"
                                  style={{
                                    fontSize: '0.4rem',
                                    lineHeight: '1.2'
                                  }}
                                >
                                  {slot.time}
                                </p>
                                {isDisplaySectionName && (
                                  <p
                                    style={{
                                      fontSize: '0.3rem',
                                      lineHeight: '1'
                                    }}
                                  >
                                    {slot.label}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Require credit card details */}
      {/* <Label className="mb-4 flex cursor-pointer items-center">
        <Checkbox
          checked={requireCreditCard}
          onCheckedChange={() => setRequireCreditCard(!requireCreditCard)}
        />
        <span className="ml-2">Require credit card details</span>
      </Label> */}
    </div>
  );
};
export default WidgetPreview;
