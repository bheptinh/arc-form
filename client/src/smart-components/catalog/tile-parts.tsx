import {
  IconHeart,
  IconInfoHexagon,
  IconRosetteDiscountFilled,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';

import { favoritesQueryOptions } from '../../api/favorites';
import { useTranslation } from '../../api/hooks/useTranslation';
import ModalMoreInfo from '../../components/common/ModalMoreInfo';
import { planner, user } from '../../initR2D';
import {
  selectDynamicPanelPreviewViewType,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
} from '../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import { selectIsLogged } from '../../redux/features/user/userSlice';
import { TileGrid } from '../../shared-components/TileGrid';
import classes from './catalog-tile.module.css';

// Catalog products come untyped from the R2D engine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Product = any;

export const isOwned = (product: Product) => !!(product.isOwner || product.material_owner);

/**
 * The colour a colour-picker material is shown and favourited in: its variant colour
 * (`addData`), or grey for a picker listed without one, as in search results.
 */
export const materialColor = (product: Product): string =>
  product.addData || (product.isColorPicker ? '#aaaaaa' : '');

const isPhone = () => ['iOS', 'Android'].includes(R2D.controller.getCurrentOS());

/**
 * A tooltip pinned to the tile's right edge and centred on an anchor inside it. Skipped on
 * phones and while a mouse button is held, i.e. while another product is being dragged.
 */
export function useTileTip(tileRef: RefObject<HTMLElement | null>) {
  const [tip, setTip] = useState<{
    left: number;
    top: number;
    content: ReactNode;
    wide: boolean;
  } | null>(null);

  const show = (e: MouseEvent, anchor: Element, content: ReactNode, wide = false) => {
    if (e.buttons || isPhone() || !tileRef.current) return;
    const tile = tileRef.current.getBoundingClientRect();
    const target = anchor.getBoundingClientRect();
    setTip({ left: tile.right, top: target.top + target.height / 2, content, wide });
  };
  const hide = () => setTip(null);

  const element = tip
    ? createPortal(
        <div
          className={tip.wide ? `${classes.tip} ${classes.tipDiscount}` : classes.tip}
          style={{ left: tip.left, top: tip.top }}
        >
          {tip.content}
        </div>,
        document.body
      )
    : null;

  return { show, hide, element };
}

/** Favourite toggle. Colour variants are favourited per colour (`addData`). */
export function FavoriteCorner({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const isLogged = useSelector(selectIsLogged);
  const { data: favorites } = useQuery(favoritesQueryOptions);
  const color = materialColor(product);
  const isFavorite = !!(favorites?.items as Product[] | undefined)?.some(
    (i) => i?.id == product.id && (i?.addData || '') == color
  );

  // The engine call updates the ['favorites'] cache itself.
  const mutation = useMutation({
    mutationFn: ({ remove }: { remove: boolean }) =>
      remove
        ? user.uRemoveFromFavorites(product.id, color)
        : user.uAddToFavorites(product.id, color),
  });

  useEffect(() => {
    if (mutation.status !== 'success') return;
    const animate = mutation.variables.remove
      ? updateAnimateFavoritesHideStatus
      : updateAnimateFavoritesShowStatus;
    dispatch(animate(true));
    setTimeout(() => dispatch(animate(false)), 10);
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
  }, [mutation.status, mutation.variables, dispatch]);

  return (
    <TileGrid.Corner
      position="top-left"
      reveal="hover"
      className={isFavorite ? `${classes.favorite} ${classes.favoriteActive}` : classes.favorite}
      onClick={() =>
        isLogged
          ? mutation.mutate({ remove: isFavorite })
          : dispatch(setActivePopup({ name: 'login' }))
      }
    >
      <IconHeart size={20} color="#464646" />
    </TileGrid.Corner>
  );
}

/** Deletes one of the user's own uploads, after a confirm popup. */
export function DeleteCorner({ product }: { product: Product }) {
  const dispatch = useDispatch();
  return (
    <TileGrid.Corner
      position="bottom-right"
      reveal="hover"
      className={classes.delete}
      onClick={() =>
        dispatch(
          setActivePopup({
            name: 'confirm',
            type: 'delete_custom_element',
            data: { id: product.id, type: product.type },
          })
        )
      }
    >
      <IconTrash size={16} color="#444" className={classes.deleteIcon} />
    </TileGrid.Corner>
  );
}

// The discount and promo code for the user's country, or the one for all countries.
function findDiscountLink(product: Product) {
  const links = product.metadata?.multilinkwithip?.data;
  if (!links) return undefined;
  const values = Object.values(links) as Product[];
  return (
    values.find((i) => i.country == R2D.config.location) || values.find((i) => i.country == 'all')
  );
}

/** Discount badge with the discount and promo code in a tooltip; nothing when there is none. */
export function PromoCorner({
  product,
  tip,
}: {
  product: Product;
  tip: ReturnType<typeof useTileTip>;
}) {
  const translation = useTranslation();
  const link = findDiscountLink(product);
  if (!link?.discount) return null;
  return (
    <TileGrid.Corner position="bottom-right">
      <IconRosetteDiscountFilled
        size={20}
        color="#FFB400"
        onMouseEnter={(e) =>
          tip.show(
            e,
            e.currentTarget,
            <>
              <div>
                <p>{translation['PRODUCT_DISCOUNT']}: </p>
                <p className={classes.tipValue}>{link.discount}%</p>
              </div>
              <div>
                <p>{translation['PRODUCT_PROMOCODE']}: </p>
                <p className={classes.tipValue}>{link.promocode}</p>
              </div>
            </>,
            true
          )
        }
        onMouseLeave={tip.hide}
      />
    </TileGrid.Corner>
  );
}

/** Opens the product details panel while hovered. Not shown at the big size, which has them inline. */
export function MoreInfoCorner({ product }: { product: Product }) {
  const size = useSelector(selectDynamicPanelPreviewViewType);
  const [open, setOpen] = useState(false);
  if (size == 'big') return null;
  return (
    <>
      <TileGrid.Corner
        position="top-right"
        reveal="hover"
        className={classes.moreInfo}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <IconInfoHexagon size={24} color="#444" />
      </TileGrid.Corner>
      <AnimatePresence>
        {open ? <ModalMoreInfo productElemHover={product} key="moreInfo" /> : null}
      </AnimatePresence>
    </>
  );
}

export function ProductColors({ product }: { product: Product }) {
  const colors: Product[] | undefined = product.source?.body?.colors;
  if (!colors) return null;
  return (
    <div className={classes.colors}>
      {colors.slice(0, 10).map((i, index) => (
        <div
          className={classes.color}
          key={index}
          style={{ backgroundImage: `url(${R2D.URL.DOMAIN + i.url})` }}
        ></div>
      ))}
      {colors.length > 10 ? (
        <div className={classes.colorsMore}>
          <img src="/src_designer/images/icon_dots.svg" alt="" />
        </div>
      ) : null}
    </div>
  );
}

/** Price, brand, sizes and other attributes. Sizes are left out for materials. */
export function ProductInfo({ product }: { product: Product }) {
  const translation = useTranslation();
  const attributes: Product[] = product.attributes ? Object.values(product.attributes) : [];
  const find = (name: string) => attributes.find((i) => i.systemName == name);
  const brand = find('brand');
  const seatingHeight = find('seating_height');
  const startingFrom = find('starting_from');
  const currency = find('currency');
  const others = attributes.filter(
    (i) => !['currency', 'starting_from', 'seating_height', 'brand'].includes(i.systemName)
  );
  const { width, depth, height } = product.property?.sizes ?? {};

  return (
    <div className={classes.info}>
      {startingFrom && currency ? (
        <div>
          {startingFrom.name}:{' '}
          <div>
            {currency.value || ''} {startingFrom.value || ''}
          </div>
        </div>
      ) : null}
      {brand ? (
        <div>
          <span style={{ marginRight: 3 }}>{brand.name}:</span>{' '}
          <span className={classes.infoValue}>{brand.value.value || ''}</span>
        </div>
      ) : null}
      {(!width && !depth && !height) || product.type == R2D.ProductType.MATERIAL ? null : (
        <div>
          {width ? (
            <>
              {translation['TEXT_WIDTH_SHORT']}:
              <span className={classes.infoValue}>{planner.units.valueToString(width)}</span>
              <span>x</span>
            </>
          ) : null}
          {depth ? (
            <>
              {translation['TEXT_DEPTH_SHORT']}:
              <span className={classes.infoValue}>{planner.units.valueToString(depth)}</span>
              <span>x</span>{' '}
            </>
          ) : null}
          {height ? (
            <>
              {translation['TEXT_HEIGHT_SHORT']}:
              <span className={classes.infoValue}>{planner.units.valueToString(height)} </span>{' '}
              {planner.units.getName()}
            </>
          ) : null}
        </div>
      )}
      {seatingHeight ? (
        <div>
          <span style={{ marginRight: 3 }}>{seatingHeight.name}: </span>
          <span className={classes.infoValue}>
            {planner.units.valueToString(seatingHeight.value)}
          </span>{' '}
          {planner.units.getName()}
        </div>
      ) : null}
      {others.map((i, index) => (
        <div className={classes.infoExtra} key={index}>
          <span>{i.name}: </span>
          {typeof i.value !== 'object' ? (
            <span className={classes.infoValue}>{i.value || ''}</span>
          ) : (
            <span>
              {i.value.map ? (
                i.value.map((y: Product, yIndex: number) => (
                  <span className={classes.infoValue} key={yIndex}>
                    {(y.value || '') + (yIndex == i.value.length - 1 ? '' : ', ')}
                  </span>
                ))
              ) : (
                <span className={classes.infoValue}>{i.value?.value || ''}</span>
              )}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
