import { IconCopy, IconRosetteDiscountFilled, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import type { CSSProperties, MouseEvent, TouchEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';

import { favoritesQueryOptions } from '../../api/favorites';
import { useTranslation } from '../../api/hooks/useTranslation';
import FavoriteStarIcon from '../../components/common/FavoriteStarIcon';
import ModalMoreInfo from '../../components/common/ModalMoreInfo';
import MoreInfoIcon from '../../components/common/MoreInfoIcon';
import HoverComponent from '../../components/left_new/parts/controlPanel/components/HoverComponent';
import { planner, user } from '../../initR2D';
import {
  selectDynamicPanelPreviewViewType,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
} from '../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import { selectIsLogged } from '../../redux/features/user/userSlice';
import { TileGrid } from '../../shared-components/TileGrid';
import classes from './product-tile.module.css';

// Catalog products come untyped from the R2D engine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;

type Props = {
  product: Product;
  // TEMPORARY until the drag moves into a useCatalogDrag hook: the panel's drag code
  // finds the tile through `className` and holds hover off with `style`.
  onDragStart: (e: MouseEvent | TouchEvent) => void;
  className?: string;
  style?: CSSProperties;
};

type Tip = { left: number; top: number; discount?: { value: number; promocode: string } };

const isPhone = () => ['iOS', 'Android'].includes(R2D.controller.getCurrentOS());

// The discount and promo code for the user's country, or the one for all countries.
function findDiscountLink(product: Product) {
  const links = product.metadata?.multilinkwithip?.data;
  if (!links) return undefined;
  const values = Object.values(links) as Product[];
  return (
    values.find((i) => i.country == R2D.config.location) || values.find((i) => i.country == 'all')
  );
}

function ProductInfo({ product }: { product: Product }) {
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

function ProductColors({ colors }: { colors: Product[] }) {
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

export default function ProductTile({ product, onDragStart, className, style }: Props) {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const size = useSelector(selectDynamicPanelPreviewViewType);
  const isLogged = useSelector(selectIsLogged);
  const { data: favorites } = useQuery(favoritesQueryOptions);
  const tileRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);

  const isOwned = product.isOwner || product.material_owner;
  const isMaterial = product.type == R2D.ProductType.MATERIAL;
  const isFavorite = !!(favorites?.items as Product[] | undefined)?.some(
    (i) => i?.id == product.id
  );
  const discountLink = isOwned ? undefined : findDiscountLink(product);
  const colors = isOwned ? undefined : product.source.body?.colors;
  const preview = R2D.URL.DOMAIN + product.source?.images.preview;

  // The engine call updates the ['favorites'] cache itself.
  const favoriteMutation = useMutation({
    mutationFn: ({ id, remove }: { id: string; remove: boolean }) =>
      remove ? user.uRemoveFromFavorites(id) : user.uAddToFavorites(id),
  });

  useEffect(() => {
    if (favoriteMutation.status !== 'success') return;
    const animate = favoriteMutation.variables.remove
      ? updateAnimateFavoritesHideStatus
      : updateAnimateFavoritesShowStatus;
    dispatch(animate(true));
    setTimeout(() => dispatch(animate(false)), 10);
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
  }, [favoriteMutation.status, favoriteMutation.variables, dispatch]);

  const toggleFavorite = () => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    favoriteMutation.mutate({ id: product.id, remove: isFavorite });
  };

  // Pins a tooltip to the tile's right edge, centred on `anchor`. Skipped on phones and
  // while a mouse button is held, i.e. while another product is being dragged.
  const showTip = (e: MouseEvent, anchor: Element, discount?: Tip['discount']) => {
    if (e.buttons || isPhone() || !tileRef.current) return;
    const tile = tileRef.current.getBoundingClientRect();
    const target = anchor.getBoundingClientRect();
    setTip({ left: tile.right, top: target.top + target.height / 2, discount });
  };
  const hideTip = () => setTip(null);

  return (
    <TileGrid.Item ref={tileRef} className={className} style={style}>
      <TileGrid.Media>
        <img data-src={preview} src={preview} className={'lazyload'} />

        {isMaterial ? (
          <TileGrid.Bar>
            <div
              className={size == 'small' ? `${classes.copy} ${classes.copySmall}` : classes.copy}
              onClick={() => R2D.CopyPaste.copyMaterial({ id: product.id })}
            >
              <HoverComponent
                hoverText={translation['BUTTON_COPY_MATERIAL']}
                hoverTextPositionX={'right'}
                hoverTextPositionY={'top'}
              >
                <IconCopy size={16} color="#fff" className={classes.copyIcon} />
              </HoverComponent>
            </div>
          </TileGrid.Bar>
        ) : null}

        <TileGrid.Corner
          position="top-left"
          reveal="hover"
          className={
            isFavorite ? `${classes.favorite} ${classes.favoriteActive}` : classes.favorite
          }
          onClick={toggleFavorite}
        >
          <FavoriteStarIcon />
        </TileGrid.Corner>
        {isOwned ? (
          <TileGrid.Corner
            position="bottom-right"
            reveal="hover"
            className={classes.delete}
            onClick={() =>
              dispatch(
                setActivePopup({ name: 'confirm', type: 'delete_custom_element', data: product.id })
              )
            }
          >
            <IconTrash size={16} color="#444" className={classes.deleteIcon} />
          </TileGrid.Corner>
        ) : null}
        {discountLink?.discount ? (
          <TileGrid.Corner position="bottom-right">
            <IconRosetteDiscountFilled
              size={20}
              color="#FFB400"
              onMouseEnter={(e) =>
                showTip(e, e.currentTarget, {
                  value: discountLink.discount,
                  promocode: discountLink.promocode,
                })
              }
              onMouseLeave={hideTip}
            />
          </TileGrid.Corner>
        ) : null}
        {size != 'big' ? (
          <TileGrid.Corner
            position="top-right"
            reveal="hover"
            className={classes.moreInfo}
            onMouseEnter={() => setMoreInfoOpen(true)}
            onMouseLeave={() => setMoreInfoOpen(false)}
          >
            <MoreInfoIcon />
          </TileGrid.Corner>
        ) : null}
      </TileGrid.Media>

      {colors && size == 'big' ? <ProductColors colors={colors} /> : null}
      <TileGrid.Title>{product.name}</TileGrid.Title>
      {!isOwned && size == 'big' ? <ProductInfo product={product} /> : null}

      <TileGrid.Overlay
        onMouseDown={(e) => {
          hideTip();
          onDragStart(e);
        }}
        onTouchStart={(e) => {
          hideTip();
          onDragStart(e);
        }}
        onMouseEnter={(e) => size == 'small' && showTip(e, e.currentTarget)}
        onMouseLeave={hideTip}
      />

      {tip
        ? createPortal(
            <div
              className={tip.discount ? `${classes.tip} ${classes.tipDiscount}` : classes.tip}
              style={{ left: tip.left, top: tip.top }}
            >
              {tip.discount ? (
                <>
                  <div>
                    <p>{translation['PRODUCT_DISCOUNT']}: </p>
                    <p className={classes.tipValue}>{tip.discount.value}%</p>
                  </div>
                  <div>
                    <p>{translation['PRODUCT_PROMOCODE']}: </p>
                    <p className={classes.tipValue}>{tip.discount.promocode}</p>
                  </div>
                </>
              ) : (
                <p>{product.name}</p>
              )}
            </div>,
            document.body
          )
        : null}

      <AnimatePresence>
        {moreInfoOpen ? <ModalMoreInfo productElemHover={product} key="moreInfo" /> : null}
      </AnimatePresence>
    </TileGrid.Item>
  );
}
