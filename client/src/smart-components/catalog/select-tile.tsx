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
  useTileTip,
} from './tile-parts';

type Props = {
  product: Product;
  // The panel decides what selecting does (a wall, a model slot, a plinth) and which one is
  // current, so both come from it.
  active: boolean;
  onSelect: () => void;
};

/**
 * A product picked by clicking, for the selected object rather than dragged into the scene.
 * Engine-built items such as plinth profiles carry their image in `imgSrc`.
 */
export default function SelectTile({ product, active, onSelect }: Props) {
  const size = useSelector(selectDynamicPanelPreviewViewType);
  const tileRef = useRef<HTMLDivElement>(null);
  const tip = useTileTip(tileRef);
  const preview = product.imgSrc || R2D.URL.DOMAIN + product.source?.images.preview;

  return (
    <TileGrid.Item ref={tileRef} active={active}>
      <TileGrid.Media>
        <img data-src={preview} src={preview} className={'lazyload'} />
        <FavoriteCorner product={product} />
        {isOwned(product) ? <DeleteCorner product={product} /> : null}
        <MoreInfoCorner product={product} />
      </TileGrid.Media>

      <TileGrid.Title>{product.name}</TileGrid.Title>

      <TileGrid.Overlay
        onClick={onSelect}
        onMouseEnter={(e) => size == 'small' && tip.show(e, e.currentTarget, <p>{product.name}</p>)}
        onMouseLeave={tip.hide}
      />
      {tip.element}
    </TileGrid.Item>
  );
}
