import {useLoaderData, Link} from '@remix-run/react';
import VideoBanner from "../components/VideoBanner";
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import {Navigation} from 'swiper/modules';
import {useState} from 'react';
import {Image, Money} from '@shopify/hydrogen';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}) {
  const tabbedCollectionHandles = ['mens-shoes', 'womens-shoes'];

  const tabbedCollections = (
    await Promise.all(
      tabbedCollectionHandles.map(async (handle) => {
        const {collection} = await context.storefront.query(
          TAB_FIRST_COLLECTION_QUERY,
          {variables: {handle}}
        );
        return collection;
      })
    )
  ).filter(Boolean);

  const {collections} = await context.storefront.query(ALL_COLLECTIONS_QUERY);

  return {
    tabbedCollections,
    allCollections: collections.nodes,
  };
}

function loadDeferredData({context}) {
  return {};
}

export default function Homepage() {
  const data = useLoaderData();
  const safeCollections = data.tabbedCollections?.filter(Boolean) || [];
  const [activeTab, setActiveTab] = useState(safeCollections[0]?.title || '');

  return (
    <div className="home">
      <VideoBanner />
      <TabProductSlider
        collections={data.tabbedCollections}
        safeCollections={safeCollections}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <CollectionProduct collections={data.allCollections} />
    </div>
  );
}

function TabProductSlider({collections, safeCollections, activeTab, setActiveTab}) {
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

function CollectionProduct({collections}) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="shop-by-category relative w-full px-4 py-8">
      <h3 className="text-2xl font-bold mb-4 text-center pb-5">Shop by Category</h3>
      <Swiper
        modules={[Navigation]}
        loop={true}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: {slidesPerView: 2},
          768: {slidesPerView: 3},
          1024: {slidesPerView: 4},
        }}
      >
        {collections.map((collection) => (
          <SwiperSlide key={collection.id}>
            <Link to={`/collections/${collection.handle}`} className="collection-card">
              {collection.image ? (
                <div>
                  <img
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    className="collection-image w-full h-[500px] object-cover"
                  />
                  <h4 className="text-lg font-medium">{collection.title}</h4>
                </div>
              ) : (
                <h4 className="text-lg font-medium">{collection.title}</h4>
              )}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const TAB_FIRST_COLLECTION_QUERY = `#graphql
  fragment TabFirstCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
    products(first: 10) {
      nodes {
        id
        title
        handle
        images(first: 1) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            priceV2 {
              amount
              currencyCode
            }
            compareAtPriceV2 {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }

  query FeaturedCollection($handle: String!) {
    collection(handle: $handle) {
      ...TabFirstCollection
    }
  }
`;

const ALL_COLLECTIONS_QUERY = `#graphql
  query AllCollections {
    collections(first: 20) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
        }
      }
    }
  }
`;
