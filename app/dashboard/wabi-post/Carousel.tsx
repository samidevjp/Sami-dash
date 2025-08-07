import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
interface CarouselProps {
  imagePreview: Array<{
    id: number;
    path: string;
    file_type: string;
    fileable_id: number;
    fileable_type: string;
  }>;
}
const Carousel: React.FC<CarouselProps> = ({ imagePreview }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const swiperRef = useRef<any>(null);
  const handlePrevSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };
  const handleNextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };
  const handleDotClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
      setCurrentImageIndex(index);
    }
  };
  return (
    <div className="relative h-full w-full bg-gray-400">
      {imagePreview?.length > 0 ? (
        <Swiper
          className="h-full w-full"
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          spaceBetween={10}
          slidesPerView={1}
          loop={true}
          onSlideChange={(swiper) => setCurrentImageIndex(swiper.realIndex)}
        >
          {imagePreview?.map((image, index) => (
            <SwiperSlide key={index}>
              <Image
                src={`${image.path}`}
                alt=""
                width={200}
                height={200}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-img.png';
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="flex h-full items-center justify-center">
          <Image
            src="/placeholder-img.png"
            alt="No Image"
            width={200}
            height={200}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      {imagePreview?.length > 1 ? (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
          >
            <ChevronRight size={24} />
          </button>
        </>
      ) : (
        <></>
      )}
      <div className="absolute bottom-4 z-10 flex w-full justify-center space-x-2">
        {imagePreview?.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentImageIndex === index ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
};
export default Carousel;
