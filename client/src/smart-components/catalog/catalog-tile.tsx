import MaterialTile from './material-tile';
import ModelTile from './model-tile';
import type { Product } from './tile-parts';

type Props = {
  product: Product;
  // Models only: click replaces the selected object instead of dragging a new one in.
  replace?: boolean;
};

/** A catalog product as a TileGrid item, laid out for its type. */
export default function CatalogTile({ product, replace }: Props) {
  return product.type == R2D.ProductType.MATERIAL ? (
    <MaterialTile product={product} />
  ) : (
    <ModelTile product={product} replace={replace} />
  );
}
