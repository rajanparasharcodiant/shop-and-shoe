import {useLoaderData, Link} from '@remix-run/react';
import VideoBanner from "../components/VideoBanner";
import TabProductSlider from "../components/TabbedProductSlider";
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import {Navigation} from 'swiper/modules';

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
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
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

  const { collections } = await context.storefront.query(ALL_COLLECTIONS_QUERY);

  return {
    tabbedCollections,
    allCollections: collections.nodes,
  };
  
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <VideoBanner />
      <TabProductSlider collections={data.tabbedCollections} />
      <CollectionProduct collections={data.allCollections} />
    </div>
  );
}


function CollectionProduct({ collections }) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="shop-by-category relative w-full px-4 py-8">
      <h3 className="text-2xl font-bold mb-4 text-center pb-5">Shop by Category</h3>
      <Swiper 
              key={collections.id}
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
      <div className="grid-products">
        {collections.map((collection) => (
          <SwiperSlide>
            <Link key={collection.id} to={`/collections/${collection.handle}`} className="collection-card">
              {collection.image ? (
                <>
                <div>
                  <img src={collection.image.url} alt={collection.image.altText || collection.title} className="collection-image w-full h-[500px] object-cover" />
                  <h4 className="text-lg font-medium">{collection.title}</h4>
                </div>
                </>
              ) : (
                <h4 className="text-lg font-medium">{collection.title}</h4>
              )}
            </Link>
            </SwiperSlide>
        ))}
      </div>
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