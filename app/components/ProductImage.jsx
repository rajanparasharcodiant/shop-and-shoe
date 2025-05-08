import { useState, useEffect } from 'react';
import { Image } from '@shopify/hydrogen';
import zoomIcon from '~/assets/zoom-in.png';
import leftArrowIcon from '~/assets/left-arrow.png';
import rightArrowIcon from '~/assets/right-arrow.png';
import closeIcon from '~/assets/close-icon.png';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import { FreeMode, Navigation, Thumbs } from 'swiper/modules';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 *   allImages: ProductVariantFragment['image'][];
 * }}
 */
export function ProductImage({ image, allImages = [] }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const currentImage = allImages[activeIndex] || image;

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isZoomed]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);


  return (
    <>
      <div className="product-image w-full max-w-[670px]">
        <Swiper
          style={{
          }}
          loop={false}
          spaceBetween={10}
          navigation={false}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper2"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          <button
            className="cursor-pointer zoom-img absolute top-2 right-2 bg-white p-2 rounded-full z-10"
            onClick={() => setIsZoomed(true)}
            aria-label="Zoom image"
          >
            <img src={zoomIcon} alt="Zoom" />
          </button>

          {allImages.map((img, index) => (
            <SwiperSlide key={img.id || index}>
              <Image
                alt={img.altText?.trim() || 'Product Image'}
                data={img}
                width={1000}
                height={1000}
                crop=''
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          onSwiper={setThumbsSwiper}
          loop={false}
          slidesPerView={4}
          spaceBetween={10}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper mt-4"
        >
          {allImages.map((img, index) => (
            <SwiperSlide key={img.id || index}>
              <img
                src={img.url}
                alt={img.altText?.trim() || 'Thumbnail'}
                className={`border-2 ${
                  index === activeIndex ? 'border-[#345546]' : 'border-transparent'
                } cursor-pointer`}
                onClick={() => setActiveIndex(index)}
                role="button"
                aria-label={`Select image ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {isZoomed && (
        <div className="zoom-container fixed inset-0 z-50 bg-white p-4 md:p-12 flex flex-col md:flex-row">
          <div className="w-full md:w-48 overflow-y-auto p-4 flex md:flex-col gap-2 items-center md:items-start">
            {allImages.map((img, index) => (
              <img
                key={img.id || index}
                src={img.url}
                alt={img.altText?.trim() || 'Thumbnail'}
                className={`border-2 ${
                  index === activeIndex ? 'border-[#345546]' : 'border-transparent'
                } cursor-pointer`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>

          <div className="flex-1 p-4 flex items-center justify-center relative">
            <button
              onClick={() => setIsZoomed(false)}
              className="cursor-pointer absolute top-4 right-4 z-10"
              aria-label="Close zoom"
            >
              <img src={closeIcon} alt="Close" />
            </button>

            <img
              src={currentImage.url}
              alt={currentImage.altText?.trim() || 'Zoomed Image'}
              className="max-w-full max-h-full object-contain"
            />

            <div className="zoom-arrows absolute bottom-4 right-4 flex gap-2">
              <button
                className="p-2 bg-[#345546] text-white text-xl rounded"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Previous image"
              >
                <img src={leftArrowIcon} alt="Previous" />
              </button>
              <button
                className="p-2 bg-[#345546] text-white text-xl rounded"
                disabled={activeIndex === allImages.length - 1}
                onClick={() =>
                  setActiveIndex((prev) => Math.min(allImages.length - 1, prev + 1))
                }
                aria-label="Next image"
              >
                <img src={rightArrowIcon} alt="Next" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
