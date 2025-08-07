import React, { useState } from 'react';
import { Product } from '../../types';
import Image from 'next/image';
import { Smartphone, Monitor, ClipboardCopy, ShoppingCart } from 'lucide-react';
import ProductCard from './ProductCard';

interface OnlineStorePreviewProps {
  businessProfile: any;
  brandImage: string;
  brandLogo: string;
  logoPreview: string;
  existingProducts: Product[];
  backgroundColor: string;
  bookNowColor: string;
  accentColor: string;
  selectedFont: string;
  link: string;
  onlineCategories: any[];
}
const OnlineStorePreview = ({
  businessProfile,
  brandImage,
  brandLogo,
  logoPreview,
  existingProducts,
  backgroundColor,
  accentColor,
  bookNowColor,
  selectedFont,
  link,
  onlineCategories
}: OnlineStorePreviewProps) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isPcViewModalVisible, setPcViewModalVisible] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const handleViewToggle = (mode: 'mobile' | 'desktop') => {
    setViewMode(mode);
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
    }, 1000);
  };
  // SP View Modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  // PC View Modal
  const togglePcViewModal = () => {
    setPcViewModalVisible(!isPcViewModalVisible);
  };
  const handleLogoError = () => {
    setLogoError(true);
  };
  // Category Button Labels

  return (
    <div className="">
      <div className="md:p-6">
        {/* Switch Prevew ----------------- */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">PREVIEW</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleViewToggle('mobile')}
              className={`rounded-md p-2 ${
                viewMode === 'mobile' ? 'bg-gray-500' : 'bg-gray-700'
              }`}
            >
              <Smartphone size={20} className="text-white" />
            </button>
            <button
              onClick={() => handleViewToggle('desktop')}
              className={`rounded-md p-2 ${
                viewMode === 'desktop' ? 'bg-gray-500' : 'bg-gray-700'
              }`}
            >
              <Monitor size={20} className="text-white" />
            </button>
          </div>
        </div>
        {/* Copy Link --------------------- */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border p-4">
          <div>
            <p className="text-xs font-bold">Online Store Link</p>
            <p className="text-xs text-gray-400">{link}</p>
          </div>
          <div className="relative flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-md bg-gray-500 px-4 py-2 text-xs text-white"
            >
              Copy Link <ClipboardCopy size={16} />
            </button>
            {linkCopied && (
              <p className="absolute right-0 top-[-25px] rounded-sm bg-gray-500 p-1 text-center text-xs text-white opacity-90">
                Copied!
              </p>
            )}
          </div>
        </div>
        {/* Preview ------------------------------------------------------- */}
        <div className="flex justify-center p-6">
          <div
            className={`relative mb-4 w-full transition-all duration-500 ${
              viewMode === 'mobile'
                ? ' max-w-64'
                : ' w-full max-w-2xl md:w-[500px]'
            }`}
          >
            <div
              className="relative"
              style={{ fontFamily: selectedFont, color: accentColor }}
            >
              <div className="relative flex items-center justify-center">
                <div className="flex h-auto w-full max-w-lg items-center justify-center rounded-3xl bg-bezel  p-3 shadow-[0_4px_15px_rgba(0,0,0,0.25)]">
                  {viewMode === 'mobile' ? (
                    <div
                      className="relative top-0 overflow-hidden rounded-3xl"
                      style={{ width: '100%', height: '100%' }}
                      {...(isModalVisible ? { onClick: toggleModal } : {})}
                    >
                      <div
                        className="inset-0 flex flex-col rounded-lg"
                        style={{
                          backgroundColor: backgroundColor,
                          height: '100%'
                        }}
                      >
                        <div className="relative flex h-[120px] w-full items-center justify-center overflow-hidden rounded-md bg-gray-400">
                          {/* KV image */}
                          <Image
                            width={200}
                            height={200}
                            src={brandImage}
                            alt=""
                            style={{ width: '100%' }}
                          />
                          {brandLogo && (
                            <div className="absolute left-2 top-2  h-8 w-8 overflow-hidden rounded-full  bg-gray-400">
                              <Image
                                width={20}
                                height={20}
                                src={
                                  logoError ? '/placeholder-img.png' : brandLogo
                                }
                                alt=""
                                className="h-full w-full object-cover"
                                onError={handleLogoError}
                              />
                            </div>
                          )}
                          <div
                            className="absolute w-full text-center text-white"
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <h3 className="text-xs font-bold text-white">
                              {businessProfile.business_name}
                            </h3>
                          </div>
                        </div>
                        <div className="h-80 overflow-hidden p-2">
                          <div className="scrollbar-none mb-2 overflow-x-hidden whitespace-nowrap">
                            <button
                              className="whitespace-nowrap rounded-full px-2 py-1"
                              style={{
                                fontSize: '0.3rem',
                                lineHeight: '1',
                                backgroundColor: bookNowColor
                              }}
                            >
                              All Products
                            </button>
                            {onlineCategories.map(
                              ({ id, category_name, bgColor }, index) => (
                                <button
                                  key={id}
                                  className="whitespace-nowrap rounded-full px-2 py-1"
                                  style={{
                                    fontSize: '0.3rem',
                                    lineHeight: '1',
                                    backgroundColor:
                                      index === 0
                                        ? bookNowColor
                                        : bgColor || 'transparent'
                                  }}
                                >
                                  {category_name}
                                </button>
                              )
                            )}
                          </div>
                          {existingProducts.length > 0 ? (
                            <div className="grid grid-cols-2 justify-between gap-4">
                              {existingProducts.map((product) => (
                                <ProductCard
                                  key={product.id}
                                  title={product.product_name || product.title}
                                  price={product.price}
                                  id={product.id}
                                  photo={
                                    product.photos && product.photos[0]
                                      ? product.photos[0].image_path
                                      : ''
                                  }
                                  pos_product_category_id={
                                    product.pos_product_category_id
                                  }
                                  category_id={product.id}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 justify-between gap-4">
                              {Array.from({ length: 9 }).map((_, index) => (
                                <ProductCard
                                  key={index}
                                  title={'Sample'}
                                  price={20}
                                  id={index}
                                  photo=""
                                  pos_product_category_id={0}
                                  category_id={0}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div
                          className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: bookNowColor
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative overflow-hidden rounded-2xl"
                      style={{
                        backgroundColor: backgroundColor,
                        width: '100%',
                        height: '100%'
                      }}
                      {...(isPcViewModalVisible
                        ? { onClick: togglePcViewModal }
                        : {})}
                    >
                      <div className="relative h-full">
                        {isPcViewModalVisible && (
                          <div
                            className="absolute inset-0  bg-black bg-opacity-50"
                            onClick={togglePcViewModal}
                          />
                        )}
                        <div
                          className="relative  flex w-full items-center justify-center overflow-hidden rounded-sm bg-gray-400"
                          style={{
                            height: '150px'
                          }}
                        >
                          {logoPreview && (
                            <Image
                              width={30}
                              height={30}
                              src={
                                logoError ? '/placeholder-img.png' : brandLogo
                              }
                              alt=""
                              className="absolute left-1/2 top-2 h-6 w-6 -translate-x-1/2"
                              onError={handleLogoError}
                            />
                          )}
                          <div
                            className="h-full w-full overflow-hidden"
                            style={{}}
                          >
                            {/* KV image */}
                            {brandImage && (
                              <Image
                                width={200}
                                height={200}
                                src={brandImage}
                                alt=""
                                style={{ width: '100%' }}
                                className="h-full w-full object-cover"
                              />
                            )}
                            {brandLogo && (
                              <div className="absolute left-2 top-2  h-8 w-8 overflow-hidden rounded-full  bg-gray-400">
                                <Image
                                  width={20}
                                  height={20}
                                  src={
                                    logoError
                                      ? '/placeholder-img.png'
                                      : brandLogo
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                  onError={handleLogoError}
                                />
                              </div>
                            )}
                          </div>
                          <div
                            className="absolute "
                            style={{
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%,-50%)',
                              color: accentColor
                            }}
                          >
                            <h3 className="text-xl font-bold text-white">
                              {businessProfile.business_name}
                            </h3>
                          </div>
                        </div>
                        <div className="relative h-40 overflow-hidden">
                          <div className="relative w-full">
                            <div className="mx-4 mb-3 mt-3 flex gap-1 overflow-hidden">
                              {onlineCategories.map(
                                ({ id, category_name, bgColor }, index) => (
                                  <button
                                    key={id}
                                    className="whitespace-nowrap rounded-full px-2 py-1"
                                    style={{
                                      fontSize: '0.3rem',
                                      lineHeight: '1',
                                      backgroundColor:
                                        index === 0
                                          ? bookNowColor
                                          : bgColor || 'transparent'
                                    }}
                                  >
                                    {category_name}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                          <div className="mx-4 mb-4">
                            {existingProducts.length > 0 ? (
                              <div className="grid grid-cols-4 justify-between gap-2">
                                {existingProducts.map((product) => (
                                  <ProductCard
                                    key={product.id}
                                    title={product.title}
                                    price={product.price}
                                    id={product.id}
                                    photo={
                                      product.photos && product.photos[0]
                                        ? product.photos[0].image_path
                                        : ''
                                    }
                                    pos_product_category_id={
                                      product.pos_product_category_id
                                    }
                                    category_id={product.id}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 justify-between gap-2">
                                {Array.from({ length: 9 }).map((_, index) => (
                                  <ProductCard
                                    key={index}
                                    title={'Sample'}
                                    price={20}
                                    id={index}
                                    photo=""
                                    pos_product_category_id={0}
                                    category_id={0}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <div
                            className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: bookNowColor
                            }}
                          >
                            <ShoppingCart className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div
                          className={`absolute left-1/2 top-1/2  w-[50%] transform rounded-sm p-3 transition-transform duration-300 ease-in-out ${
                            isPcViewModalVisible
                              ? 'translate-x-0 translate-y-0 opacity-100'
                              : 'translate-x-full translate-y-full opacity-0'
                          }`}
                          style={{
                            backgroundColor: backgroundColor,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OnlineStorePreview;
