import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="cart-line">
      {image && (
        <Image
          className='cart-line-image'
          alt={title}
          aspectRatio="0.8/1"
          data={image}
          height={140}
          loading="lazy"
          width='auto'
        />
      )}

      <div>
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              close();
            }
          }}
        >
          <p>
            {product.title}
          </p>
        </Link>
        <ProductPrice price={line?.cost?.totalAmount} />
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small>
                {option.name}: {option.value}
              </small>
            </li>
          ))}
        </ul>
        <CartLineQuantity line={line} />
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return ( 
    <div className="cart-line-quantity">
      <div className='quantity-control'>
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          <span>&#8722; </span>
        </button>
      </CartLineUpdateButton>
      <span className='quantity-value'>{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
        >
          <span>&#43;</span>
        </button>
      </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button disabled={disabled} type="submit">
        <img src='https://cdn.shopify.com/s/files/1/0661/1900/8416/files/bin.png?v=1738821953' className='remove-cart-item' alt='Remove' />
      </button>
    </CartForm>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
