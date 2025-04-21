import {useState} from 'react';
import {Image} from '@shopify/hydrogen';
import zoomIcon from '~/assets/zoom-in.png';
import leftArrowIcon from '~/assets/left-arrow.png';
import rightArrowIcon from '~/assets/right-arrow.png';
import closeIcon from '~/assets/close-icon.png';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 *   allImages: ProductVariantFragment['image'][];
 * }}
 */
export function ProductImage({image, allImages = []}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentImage = allImages[activeIndex] || image;
  const zoomicon = <img src={zoomIcon} alt="zoom"/>;
  const leftarrowicon = <img src={leftArrowIcon} alt="zoom"/>;
  const rightarrowicon = <img src={rightArrowIcon} alt="zoom"/>;
  const closeicon = <img src={closeIcon} alt="zoom"/>;

  return (
    <>
      <div
        className="product-image relative">
        <button className="cursor-pointer zoom-img absolute top-[0] right-[0] bg-white p-[8px] rounded-full" onClick={() => setIsZoomed(true)}>
         {zoomicon}
        </button>
        <Image
          alt={image.altText || 'Product Image'}
          data={image}
          key={image.id}
          width={600}
          height={600}
          crop=""
        />
      </div>

      {isZoomed && (
        <>
        <div className='zoom-container'>
          <div className='custom-overflow absolute left-[0] right-[0] top-[0] bottom-[0]'></div>
            <div className="zoom-popup fixed inset-0 z-50 p-[50px] bg-white flex max-w-[80%]">
            <div className="w-[200px] overflow-y-auto p-10 flex flex-col items-center gap-2">
              {allImages.map((img, index) => (
                <img
                  key={img.id || index}
                  src={img.url}
                  alt={img.altText || 'Thumbnail'}
                  className={` border-2 ${
                    index === activeIndex ? 'border-[#345546]' : 'border-transparent'
                  } cursor-pointer`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>

            <div className="p-10 flex-1 flex items-center justify-center relative bg-white">
              <button
                onClick={() => setIsZoomed(false)}
                className="cursor-pointer absolute top-4 right-4 text-black text-3xl z-10"
              >
                {closeicon}
              </button>

              <img
                src={currentImage.url}
                alt={currentImage.altText || 'Zoomed Image'}
                className=""
              />

              <div className="zoom-arrows absolute bottom-4 right-4 flex gap-2">
                <button
                  className="cursor-pointer p-2 bg-[#345546] text-white border border-[#345546] text-6xl"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                >
                  { leftarrowicon }
                </button>
                <button
                  className="cursor-pointer p-2 bg-[#345546] text-white border border-[#345546] text-6xl"
                  disabled={activeIndex === allImages.length - 1}
                  onClick={() =>
                    setActiveIndex((prev) =>
                      Math.min(allImages.length - 1, prev + 1),
                    )
                  }
                >
                  { rightarrowicon }
                </button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
