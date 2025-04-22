import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ProductFilter} from '~/components/ProductFilter.jsx';

export const meta = () => {
  return [{title: `Hydrogen | All Products`}];
};

export async function loader({context, request}) {
  const {storefront} = context;

  const paginationVariables = getPaginationVariables(request, {pageBy: 100});
  const url = new URL(request.url);
  const filters = parseFiltersFromSearchParams(url.searchParams);

  const variables = {
    handle: 'all',
    ...paginationVariables,
    ...(filters.length > 0 && {filters}),
  };

  console.log('🧪 FILTERS:', filters);
  console.log('📦 VARIABLES:', variables);

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables,
  });

  if (!collection || !collection.products) {
    throw new Response(`Collection "all" not found or has no products`, {status: 404});
  }

  return {collection};
}

function parseFiltersFromSearchParams(searchParams) {
  const filters = [];

  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;

    if (key.startsWith('filter.v.option.')) {
      const optionName = key.replace('filter.v.option.', '');
      filters.push({
        variantOption: {
          name: optionName,
          value,
        },
      });
    }

    if (key === 'filter.v.price.gte') {
      filters.push({price: {min: parseFloat(value)}});
    }

    if (key === 'filter.v.price.lte') {
      filters.push({price: {max: parseFloat(value)}});
    }

    if (key.startsWith('filter.p.m.')) {
      const match = key.match(/^filter\.p\.m\.([^.]+)\.([^.]+)$/);
      if (match) {
        const [, namespace, metafieldKey] = match;
        filters.push({
          productMetafield: {
            namespace,
            key: metafieldKey,
            value,
          },
        });
      }
    }
  }

  return filters;
}

export default function CollectionAll() {
  const {collection} = useLoaderData();
  const products = collection.products;

  return (
    <div className="page-width">
      <div className="collection">
        <h1 className='collection-page-title'>{collection.title}</h1>
        <div className="products-grid-wrapper">
          <div className="products-grid-filter">
            <h2>Filter</h2>
            <ProductFilter filters={products.filters || []} />
          </div>
          <div className="products-grid">
            {products.nodes?.length > 0 ? (
              <div className="products-grid-items">
                {products.nodes.map((product, index) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    loading={index < 8 ? 'eager' : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No matching products found.</p>
                <Link to="?"><button>Clear Filters</button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const [showPopup, setShowPopup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const {open} = useAside();

  const [selectedOptions, setSelectedOptions] = useState(
    product.variants.nodes[0]?.selectedOptions.reduce((acc, option) => {
      acc[option.name] = option.value;
      return acc;
    }, {}) || {}
  );

  const [selectedVariant, setSelectedVariant] = useState(product.variants.nodes[0]);

  const variantOptions = product.variants.nodes.reduce((acc, variant) => {
    variant.selectedOptions.forEach(option => {
      if (!acc[option.name]) acc[option.name] = [];
      if (!acc[option.name].some(v => v.value === option.value)) {
        acc[option.name].push({
          id: variant.id,
          value: option.value,
          image: variant.image || product.images.nodes[0],
          price: variant.price,
          availableForSale: variant.availableForSale,
        });
      }
    });
    return acc;
  }, {});

  const handleOptionChange = (optionName, optionValue) => {
    const updatedOptions = {...selectedOptions, [optionName]: optionValue};
    const matchedVariant = product.variants.nodes.find(variant =>
      variant.selectedOptions.every(option => updatedOptions[option.name] === option.value)
    );
    if (matchedVariant) setSelectedVariant(matchedVariant);
    setSelectedOptions(updatedOptions);
  };

  useEffect(() => {
    document.body.classList.toggle('scroll-off', showPopup);
    return () => document.body.classList.remove('scroll-off');
  }, [showPopup]);

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      open('cart');
      setShowPopup(false);
    }, 1000);
  };

  return (
    <>
      <div className="product-item">
        <div className="product-grid-image">
          <Link key={product.id} prefetch="intent" to={variantUrl}>
            <Image
              alt={selectedVariant.image?.altText || product.title}
              aspectRatio="1/1"
              data={selectedVariant.image || product.featuredImage}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
            />
          </Link>
          <button className="quick-view-btn" onClick={() => setShowPopup(true)}>➕</button>
        </div>
        <Link to={variantUrl}><h4>{product.title}</h4></Link>
        <small><Money data={selectedVariant.price} /></small>
      </div>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPopup(false)}>✖</button>
            <div className="popup-container">
              <div className="popup-image-container">
                <Image data={selectedVariant.image || product.images.nodes[0]} sizes="(min-width: 45em) 20vw, 50vw" />
              </div>
              <div className="popup-content-details">
                <h2 className="popup-product-title">{product.title}</h2>
                <span className="popup-product-price"><Money data={selectedVariant.price} /></span>
                <p className="popup-product-description">{product.description}</p>
                <div className="product-form popup-variant-swatches">
                  {Object.entries(variantOptions).map(([optionName, variants]) => (
                    <div key={optionName} className="variant-group product-options">
                      <h4>{optionName}</h4>
                      <div className="variant-options">
                        {variants.map((variant) => (
                          optionName === "Color" ? (
                            <button key={variant.id}
                              style={{ backgroundColor: variant.value }}
                              className={`color-swatch ${selectedOptions[optionName] === variant.value ? "selected" : ""}`}
                              onClick={() => handleOptionChange(optionName, variant.value)}
                            />
                          ) : (
                            <button key={variant.id}
                              onClick={() => handleOptionChange(optionName, variant.value)}
                              className={`popup-variant-button ${selectedOptions[optionName] === variant.value ? "selected" : ""}`}
                              style={{
                                opacity: variant.availableForSale ? "1" : "0.5",
                                boxShadow: selectedOptions[optionName] === variant.value ? "0 0 10px #ccc" : "none",
                              }}
                            >
                              {variant.value}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                  <AddToCartButton
                    disabled={!selectedVariant?.availableForSale}
                    lines={selectedVariant ? [{merchandiseId: selectedVariant.id, quantity: 1}] : []}
                    onClick={handleAddToCart}
                  >
                    {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
                  </AddToCartButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItems on Product {
    id
    handle
    title
    tags
    description
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { ...MoneyProductItem }
      maxVariantPrice { ...MoneyProductItem }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
        image { id url altText width height }
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query AllCollection(
    $handle: String!
    $filters: [ProductFilter!]
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        filters: $filters
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
      ) {
        nodes { ...ProductItems }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

