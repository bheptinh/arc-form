import { useState } from 'react';

// The engine's own Event class, which carries COMPLETE and ERROR alongside the DOM Event API.
const R2D_EVENT = Event as unknown as { COMPLETE: string; ERROR: string };

type MaterialSelect = (id: string, addId: null, prevId: string, addPrevId: null) => void;

/**
 * The active material of a material picker, and selecting another one. Selecting loads the
 * material's data into the engine first if needed, then hands it to `materialSelect`, which
 * applies it to whatever opened the picker.
 */
export function useMaterialSelect(materialSelect: MaterialSelect, initialId: string) {
  const [activeMaterial, setActiveMaterial] = useState(initialId);

  const select = (id: string) => {
    const apply = () => materialSelect(id, null, activeMaterial, null);
    if (R2D.Pool.getProductData(id)) {
      apply();
    } else {
      const loader = R2D.Pool.loadProductData(id);
      loader.addEventListener(R2D_EVENT.COMPLETE, () => {
        apply();
        setActiveMaterial(id);
      });
      loader.addEventListener(R2D_EVENT.ERROR, (e: unknown) =>
        console.log('Error loading material ', e)
      );
    }
    setActiveMaterial(id);
  };

  return { activeMaterial, setActiveMaterial, select };
}
