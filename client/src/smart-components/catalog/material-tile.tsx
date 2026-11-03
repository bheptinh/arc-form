import { IconCopy } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import HoverComponent from '../../components/left_new/parts/controlPanel/components/HoverComponent';
import { selectDynamicPanelPreviewViewType } from '../../redux/features/control/controlPanelSlice';
import { TileGrid } from '../../shared-components/TileGrid';
import classes from './catalog-tile.module.css';
import {
  DeleteCorner,
  FavoriteCorner,
  isOwned,
  materialColor,
  MoreInfoCorner,
  type Product,
  ProductColors,
  ProductInfo,
  PromoCorner,
  useTileTip,
} from './tile-parts';
import { useMaterialDrag } from './use-catalog-drag';

/**
 * The material's preview image. A colour-picker material is rendered by the engine in its
 * colour once the base material has loaded, so it is null until then.
 */
function useMaterialPreview(product: Product) {
  const color = materialColor(product);
  const isVariant = !!(product.isColorPicker && color);
  const [variantPreview, setVariantPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isVariant) return;
    R2D.PoolMaterials.getMaterial(product.id);
    const timer = setInterval(async () => {
      if (!R2D.PoolMaterials.isMaterial(product.id)?.getMaterialLoadState()) return;
      clearInterval(timer);
      const canvas = await R2D.Tool.getMatPrevFromMatIdAndColor(product.id, color);
      setVariantPreview(canvas.toDataURL());
    }, 100);
    return () => clearInterval(timer);
  }, [isVariant, product.id, color]);

  return isVariant ? variantPreview : R2D.URL.DOMAIN + product.source?.images.preview;
}

/** A wall, floor or ceiling material, dragged onto a surface. */
export default function MaterialTile({ product }: { product: Product }) {
  const translation = useTranslation();
  const size = useSelector(selectDynamicPanelPreviewViewType);
  const tileRef = useRef<HTMLDivElement>(null);
  const tip = useTileTip(tileRef);
  const drag = useMaterialDrag(product);
  const preview = useMaterialPreview(product);
  const owned = isOwned(product);
  // Colour variants are copied as the colour applied to the base material.
  const copy = () =>
    R2D.CopyPaste.copyMaterial(
      product.addData ? { id: product.addData, addMaterial: product.id } : { id: product.id }
    );

  return (
    <TileGrid.Item ref={tileRef}>
      <TileGrid.Media>
        {preview ? (
          <img data-src={preview} src={preview} className={'lazyload'} />
        ) : (
          <div className="preloader-cube"></div>
        )}
        <TileGrid.Bar>
          <div
            className={size == 'small' ? `${classes.copy} ${classes.copySmall}` : classes.copy}
            onClick={copy}
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
        <FavoriteCorner product={product} />
        {owned ? <DeleteCorner product={product} /> : <PromoCorner product={product} tip={tip} />}
        <MoreInfoCorner product={product} />
      </TileGrid.Media>

      {!owned && size == 'big' ? <ProductColors product={product} /> : null}
      <TileGrid.Title>{product.name}</TileGrid.Title>
      {!owned && size == 'big' ? <ProductInfo product={product} /> : null}

      <TileGrid.Overlay
        onMouseDown={(e) => {
          tip.hide();
          drag.onMouseDown(e);
        }}
        onMouseEnter={(e) =>
          size == 'small' &&
          tip.show(
            e,
            e.currentTarget,
            <>
              <p>{product.name}</p>
              {product.addData ? <p className={classes.tipColor}>{product.addData}</p> : null}
            </>
          )
        }
        onMouseLeave={tip.hide}
      />
      {tip.element}
    </TileGrid.Item>
  );
}
