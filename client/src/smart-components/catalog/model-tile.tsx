import { useRef } from 'react';
import { useSelector } from 'react-redux';

import { selectDynamicPanelPreviewViewType } from '../../redux/features/control/controlPanelSlice';
import { TileGrid } from '../../shared-components/TileGrid';
import {
  DeleteCorner,
  FavoriteCorner,
  isOwned,
  MoreInfoCorner,
  type Product,
  ProductColors,
  ProductInfo,
  PromoCorner,
  useTileTip,
} from './tile-parts';
import { useModelDrag } from './use-catalog-drag';

type Props = {
  product: Product;
  // Click replaces the selected object instead of dragging a new one in.
  replace?: boolean;
};

/** A furniture or decor model, dragged into the scene. */
export default function ModelTile({ product, replace }: Props) {
  const size = useSelector(selectDynamicPanelPreviewViewType);
  const tileRef = useRef<HTMLDivElement>(null);
  const tip = useTileTip(tileRef);
  const drag = useModelDrag(product, tileRef, { replace });
  const owned = isOwned(product);
  const preview = R2D.URL.DOMAIN + product.source?.images.preview;

  return (
    <TileGrid.Item ref={tileRef}>
      <TileGrid.Media>
        <img data-src={preview} src={preview} className={'lazyload'} />
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
        onTouchStart={(e) => {
          tip.hide();
          drag.onTouchStart(e);
        }}
        onMouseEnter={(e) => size == 'small' && tip.show(e, e.currentTarget, <p>{product.name}</p>)}
        onMouseLeave={tip.hide}
      />
      {tip.element}
    </TileGrid.Item>
  );
}
