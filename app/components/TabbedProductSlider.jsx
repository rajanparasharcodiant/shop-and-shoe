import {useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import {Navigation} from 'swiper/modules';
import {Image, Money} from '@shopify/hydrogen';
import { Link } from '@remix-run/react';

export default function TabbedProductSlider({collections}) {
  if (!collections?.length) return null;

  const safeCollections = collections.filter(Boolean);
  const [activeTab, setActiveTab] = useState(safeCollections[0]?.title || '');

  return (
    <div className="product-tab-shopify-section relative w-full px-4 py-8">
      <h3 className="text-2xl font-bold mb-4 text-center pb-5">Shop the Latest</h3>

      <div className="justify-center flex space-x-4 mb-4">
        {safeCollections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => setActiveTab(collection.title)}
            className={`px-4 border border-[#345546] py-2 cursor-pointer rounded-full text-sm font-semibold transition ${
              activeTab === collection.title
                ? 'bg-[#345546] text-white'
                : 'text-[#345546]'
            }`}
          >
            {collection.title}
          </button>
        ))}
      </div>
      {safeCollections.map(
        (collection) =>
          activeTab === collection.title && (
            <Swiper
              key={collection.id}
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              scrollbar={true}
              spaceBetween={16}
              slidesPerView={2}
              breakpoints={{
                640: {slidesPerView: 2},
                768: {slidesPerView: 3},
                1024: {slidesPerView: 4},
              }}
            >
              {collection.products.nodes.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="p-2">
                    {product.images?.nodes?.[0] && (
                      <Link to={`/products/${product.handle}`}>
                      <Image
                        data={product.images.nodes[0]}
                        sizes="(min-width: 45em) 20vw, 50vw"
                        crop=""
                        height={1000}
                        width={1000}
                      />
                      </Link>
                    )}
                    <span className="p-4 block">
                      <h4 className="text-lg font-medium">{product.title}</h4>
                      <span className="tab-content-price flex gap-2 items-center">
                        {product.variants.nodes[0]?.compareAtPriceV2 && (
                          <span className="text-sm text-gray-400 line-through">
                            <Money data={product.variants.nodes[0].compareAtPriceV2} />
                          </span>
                        )}
                        <span className="text-lg font-semibold text-[#345546]-600">
                          <Money data={product.priceRange.minVariantPrice} />
                        </span>
                      </span>
                    </span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )
      )}
      <div className="swiper-nav-buttons flex justify-between mb-4">
        <button className="swiper-button-prev tab-swiper-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button className="swiper-button-next tab-swiper-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
