import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import 'swiper/css';
import { ImageData } from '@/app/dashboard/reservation-settings/type';
import { MV_TYPE } from '@/app/dashboard/reservation-settings/enums-settings';

const Carousel = ({
  imagePreview,
  businessProfile,
  mvType
}: {
  imagePreview: Array<ImageData>;
  businessProfile: { business_name: string; address: string };
  mvType: keyof typeof MV_TYPE;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (swiperRef.current) {
        swiperRef.current.slideNext();
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
      setCurrentImageIndex(index);
    }
  };

  const handleImageError = (imagePath: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [imagePath]: true
    }));
  };

  useEffect(() => {
    console.log(mvType, 'mvType');
  }, [mvType]);

  return (
    <div className="relative h-full w-full bg-gray-400">
      {imagePreview.length > 0 ? (
        <Swiper
          className={`h-full w-full`}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          spaceBetween={10}
          slidesPerView={1}
          loop={true}
          onSlideChange={(swiper) => setCurrentImageIndex(swiper.realIndex)}
        >
          {imagePreview.map((image, index) => (
            <SwiperSlide key={index}>
              {mvType === MV_TYPE.FullImage ? (
                <div className="relative h-full w-full">
                  {/* Blur Image*/}
                  <Image
                    src={
                      imageErrors[image.path]
                        ? '/placeholder-img.png'
                        : image.path
                    }
                    alt=""
                    layout="fill"
                    objectFit="cover"
                    className="scale-110 blur-[20px]"
                    onError={() => handleImageError(image.path)}
                  />
                  {/* Clear Image */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="relative h-full w-full shadow-sm">
                      <Image
                        src={
                          imageErrors[image.path]
                            ? '/placeholder-img.png'
                            : image.path
                        }
                        alt=""
                        layout="intrinsic"
                        width={400}
                        height={300}
                        className="max-h-full max-w-full object-contain"
                        onError={() => handleImageError(image.path)}
                      />
                    </div>
                  </div>
                </div>
              ) : mvType === MV_TYPE.Cropped ? (
                <div className="relative h-full w-full">
                  {/* Blur Image*/}
                  <Image
                    src={
                      imageErrors[image.path]
                        ? '/placeholder-img.png'
                        : image.path
                    }
                    alt=""
                    layout="fill"
                    objectFit="cover"
                    className="scale-110 blur-[20px]"
                    onError={() => handleImageError(image.path)}
                  />
                  {/* Clear Image */}
                  <div className="absolute inset-0 z-10 mx-auto flex max-w-[420px] items-center justify-center">
                    <div className="relative h-full w-full shadow-sm">
                      <Image
                        src={
                          imageErrors[image.path]
                            ? '/placeholder-img.png'
                            : image.path
                        }
                        alt=""
                        layout="fill"
                        objectFit="cover"
                        onError={() => handleImageError(image.path)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full">
                  {/* Blur Image*/}
                  <Image
                    src={
                      imageErrors[image.path]
                        ? '/placeholder-img.png'
                        : image.path
                    }
                    alt=""
                    layout="fill"
                    objectFit="cover"
                    className="scale-110 blur-[20px]"
                    onError={() => handleImageError(image.path)}
                  />
                  {/* Clear Image */}
                  <div className="absolute inset-0 z-10 mx-auto flex max-w-[420px] items-center justify-center">
                    <div className="relative h-full w-full shadow-sm">
                      <Image
                        src={
                          imageErrors[image.path]
                            ? '/placeholder-img.png'
                            : image.path
                        }
                        alt=""
                        layout="fill"
                        objectFit="cover"
                        onError={() => handleImageError(image.path)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="relative h-full w-full shadow-sm">
            <Image
              src="/placeholder-img.png"
              alt="No Image"
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
      <div className="absolute bottom-4 flex w-full justify-center space-x-2">
        {imagePreview.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentImageIndex === index ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 w-full p-2">
        <h3 className="text-xs font-bold">{businessProfile.business_name}</h3>
        <p className="" style={{ fontSize: '0.6rem' }}>
          {businessProfile.address}
        </p>
      </div>
    </div>
  );
};

export default Carousel;
